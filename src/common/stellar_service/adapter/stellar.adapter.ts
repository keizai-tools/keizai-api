import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  Memo,
  Networks,
  Operation,
  StrKey,
  Transaction,
  TransactionBuilder,
  contract,
  rpc,
  xdr,
} from '@stellar/stellar-sdk';
import * as StellarServer from '@stellar/stellar-sdk';
import { randomBytes } from 'crypto';
import { lastValueFrom } from 'rxjs';

import {
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';
import { EPHEMERAL_ENVIRONMENT_SERVICE } from '@/modules/ephemeralEnvironment/application/interface/ephemeralEnvironment.interface';
import { EphemeralEnvironmentService } from '@/modules/ephemeralEnvironment/application/service/ephemeralEnvironment.service';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application/interfaces/user.repository.interfaces';

import {
  ErrorMessages,
  GetTransactionStatus,
  HORIZON_NETWORK,
  NETWORK,
  SOROBAN_CONTRACT_ERROR,
  SOROBAN_SERVER,
} from '../application/domain/soroban.enum';
import {
  EncodeEvent,
  GetTransactionResponse,
  RawGetTransactionResponse,
  RawSendTransactionResponse,
} from '../application/interface/soroban';
import { IStellarAdapter } from '../application/interface/stellar.adapter.interface';

@Injectable()
export class StellarAdapter implements IStellarAdapter {
  private server: rpc.Server;
  private networkPassphrase: string;
  private stellarServer: StellarServer.Horizon.Server;
  private currentNetwork: string;
  private networkConfig = {
    [NETWORK.SOROBAN_FUTURENET]: {
      server: new rpc.Server(SOROBAN_SERVER.FUTURENET),
      networkPassphrase: Networks.FUTURENET,
      horizonServer: new StellarServer.Horizon.Server(
        HORIZON_NETWORK.FUTURENET,
      ),
    },
    [NETWORK.SOROBAN_TESTNET]: {
      server: new rpc.Server(SOROBAN_SERVER.TESTNET),
      networkPassphrase: Networks.TESTNET,
      horizonServer: new StellarServer.Horizon.Server(HORIZON_NETWORK.TESTNET),
    },
    [NETWORK.SOROBAN_MAINNET]: {
      server: new rpc.Server(SOROBAN_SERVER.MAINNET),
      networkPassphrase: Networks.PUBLIC,
      horizonServer: new StellarServer.Horizon.Server(HORIZON_NETWORK.MAINNET),
    },
    [NETWORK.SOROBAN_EPHEMERAL]: {
      server: null,
      networkPassphrase: Networks.STANDALONE,
    },
  };

  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    @Inject(EPHEMERAL_ENVIRONMENT_SERVICE)
    private readonly ephemeralEnvironmentService: EphemeralEnvironmentService,
    private readonly httpService: HttpService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
    this.responseService.setContext(StellarAdapter.name);
    this.setNetwork(NETWORK.SOROBAN_FUTURENET);
  }

  public async changeNetwork(
    selectedNetwork: NETWORK,
    userId: string,
  ): Promise<void> {
    await this.wrapWithErrorHandling(async () => {
      if (selectedNetwork === NETWORK.SOROBAN_EPHEMERAL) {
        await this.validateEphemeralNetwork(selectedNetwork, userId);
      }
      this.setNetwork(selectedNetwork);
    });
  }

  private async validateEphemeralNetwork(network: string, userId?: string) {
    if (!userId) {
      throw new BadRequestException(ErrorMessages.NO_USER_PROVIDED);
    }

    const isEphemeral = (
      await this.ephemeralEnvironmentService.getTaskStatus(userId)
    ).payload;

    if (!isEphemeral) {
      throw new InternalServerErrorException(
        `Network ${network} is not an ephemeral network.`,
      );
    }
    const url = `http://${isEphemeral.publicIp}:8000/soroban/rpc`;

    this.networkConfig[NETWORK.SOROBAN_EPHEMERAL].server = new rpc.Server(url, {
      allowHttp: true,
    });

    return {
      status: isEphemeral.status,
      taskArn: isEphemeral.taskArn,
      publicIp: isEphemeral.publicIp,
    };
  }

  public getScSpecEntryFromXDR(input: Uint8Array): xdr.ScSpecEntry {
    return xdr.ScSpecEntry.fromXDR(
      Buffer.from(input).toString('base64'),
      'base64',
    );
  }

  public createContractSpec(
    entries: xdr.ScSpecEntry[],
  ): Promise<contract.Spec> {
    return this.wrapWithErrorHandling(() => new contract.Spec(entries));
  }

  public async contractExists(
    contractId: string,
    currentNetwork: string,
  ): Promise<rpc.Api.GetLedgerEntriesResponse> {
    return await this.wrapWithErrorHandling(async () => {
      const network =
        currentNetwork === NETWORK.SOROBAN_AUTO_DETECT
          ? await this.checkContractNetwork(contractId)
          : currentNetwork;

      this.setNetwork(network);
      return await this.fetchFromServer(
        'getLedgerEntries',
        this.createInstanceKey(contractId),
      );
    });
  }

  public async getInstanceValue(
    contractId: string,
    currentNetwork: string,
  ): Promise<xdr.ContractExecutable> {
    return await this.wrapWithErrorHandling(async () => {
      const response = await this.contractExists(contractId, currentNetwork);
      return this.extractExecutableFromLedgerResponse(response);
    });
  }

  public async getWasmCode(instance: xdr.ContractExecutable): Promise<Buffer> {
    return await this.wrapWithErrorHandling(async () => {
      const codeKey = this.createWasmCodeKey(instance);
      return await this.fetchFromServer('getLedgerEntries', codeKey).then(
        (response) => {
          if (response.entries.length === 0) {
            throw new BadRequestException(
              SOROBAN_CONTRACT_ERROR.NO_ENTRIES_FOUND,
            );
          }
          return response.entries[0]?.val?.contractCode().code();
        },
      );
    });
  }

  public async getContractEvents(contractId: string): Promise<EncodeEvent[]> {
    return await this.wrapWithErrorHandling(async () => {
      const sequence = await this.fetchFromServer('getLatestLedger');
      const startLedger = this.calculateStartLedger(sequence.sequence);
      const { events } = await this.fetchFromServer('getEvents', {
        startLedger,
        filters: [{ contractIds: [contractId] }],
        limit: 20,
      });
      return events.reverse();
    });
  }

  public getKeypair(secretKey: string): Keypair {
    return Keypair.fromSecret(secretKey);
  }

  public async sendTransaction(
    transaction: Transaction,
    useRaw = false,
  ): Promise<RawSendTransactionResponse | rpc.Api.SendTransactionResponse> {
    return await this.wrapWithErrorHandling(async () => {
      return useRaw
        ? await this.fetchFromServer('_sendTransaction', transaction)
        : await this.fetchFromServer('sendTransaction', transaction);
    });
  }

  public async getTransaction(
    hash: string,
    useRaw = false,
  ): Promise<RawGetTransactionResponse | GetTransactionResponse> {
    return await this.wrapWithErrorHandling(async () => {
      return useRaw
        ? await this.fetchFromServer('_getTransaction', hash)
        : await this.fetchFromServer('getTransaction', hash);
    });
  }

  public async uploadWasm(
    file: Express.Multer.File,
    userId: string,
    publicKey: string,
    secretKey?: string,
  ): Promise<string> {
    return await this.wrapWithErrorHandling(async () => {
      const operation = Operation.uploadContractWasm({ wasm: file.buffer });
      if (!this.getAccountOrFund)
        await this.changeNetwork(NETWORK.SOROBAN_EPHEMERAL, userId);
      const account = await this.getAccountOrFund(publicKey, userId);
      const preparedTx = await this.prepareTransaction(
        account,
        userId,
        operation,
      );

      if (secretKey) {
        const sourceKeypair = Keypair.fromSecret(secretKey);
        this.signTransaction(preparedTx, sourceKeypair);
        const response = await this.executeTransactionWithRetry(preparedTx);
        return await this.deployContract(response, sourceKeypair, userId);
      } else {
        return preparedTx.toXDR();
      }
    });
  }

  public async deployContract(
    response: rpc.Api.GetSuccessfulTransactionResponse,
    sourceKeypair: Keypair,
    userId: string,
  ): Promise<string> {
    return await this.wrapWithErrorHandling(async () => {
      if (!this.getAccountOrFund)
        await this.changeNetwork(NETWORK.SOROBAN_EPHEMERAL, userId);
      const account = await this.getAccountOrFund(
        sourceKeypair.publicKey(),
        userId,
      );
      const operation = this.createDeployContractOperation(
        response,
        sourceKeypair,
      );

      const responseDeploy: rpc.Api.GetSuccessfulTransactionResponse =
        await this.buildAndSendTransaction(
          account,
          operation,
          sourceKeypair,
          userId,
        );
      return this.extractContractAddress(responseDeploy);
    });
  }

  public async submitSignedTransaction(
    signedXdr: string,
  ): Promise<rpc.Api.SendTransactionResponse> {
    return await this.wrapWithErrorHandling(async () => {
      const transaction = TransactionBuilder.fromXDR(
        signedXdr,
        this.networkPassphrase,
      );
      const response: rpc.Api.SendTransactionResponse =
        await this.server.sendTransaction(transaction);
      return response;
    });
  }

  public async prepareUploadWASM(
    file: Express.Multer.File,
    publicKey: string,
    userId: string,
  ): Promise<string> {
    await this.getAccountOrFund(publicKey, userId);

    return await this.wrapWithErrorHandling(async (): Promise<string> => {
      if (!this.getAccountOrFund)
        await this.changeNetwork(NETWORK.SOROBAN_EPHEMERAL, userId);
      const account: Account = await this.getAccountOrFund(publicKey, userId);
      const operation: xdr.Operation<Operation.InvokeHostFunction> =
        Operation.uploadContractWasm({
          wasm: file.buffer,
        });
      return (
        await this.prepareTransaction(account, userId, operation)
      ).toXDR();
    });
  }

  public signTransaction(
    transaction: Transaction,
    sourceKeypair: Keypair,
  ): void {
    transaction.sign(sourceKeypair);
  }

  public async prepareTransaction(
    account: Account | string,
    userId: string,
    operationsOrContractId?:
      | xdr.Operation<Operation.InvokeHostFunction>
      | { contractId: string; methodName: string; scArgs: xdr.ScVal[] },
  ): Promise<Transaction> {
    return await this.wrapWithErrorHandling(async () => {
      let transaction: Transaction;
      let memoObj: Memo;
      if (typeof account === 'string') {
        const publicKey = account;
        const { contractId, methodName, scArgs } = operationsOrContractId as {
          contractId: string;
          methodName: string;
          scArgs: xdr.ScVal[];
        };
        const accountObj = await this.getAccountOrFund(publicKey, userId);
        const contract = new Contract(contractId);
        transaction = this.createTransaction({
          account: accountObj,
          contract,
          methodName,
          scArgs,
          memo: memoObj,
        });
      } else {
        const operations =
          operationsOrContractId as xdr.Operation<Operation.InvokeHostFunction>;
        transaction = this.createTransaction({
          account,
          operations,
          memo: memoObj,
        });
      }
      return await this.server.prepareTransaction(transaction);
    });
  }

  private async buildAndSendTransaction(
    account: Account,
    operations: xdr.Operation<Operation.InvokeHostFunction>,
    sourceKeypair: Keypair,
    userId: string,
  ): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
    const preparedTx = await this.prepareTransaction(
      account,
      userId,
      operations,
    );
    this.signTransaction(preparedTx, sourceKeypair);
    return await this.executeTransactionWithRetry(preparedTx);
  }

  private createTransaction({
    account,
    contract,
    methodName,
    scArgs,
    operations,
  }: {
    account: Account;
    contract?: Contract;
    methodName?: string;
    scArgs?: xdr.ScVal[];
    operations?: xdr.Operation<Operation.InvokeHostFunction>;
    memo: Memo;
  }): Transaction {
    const builder = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    }).setTimeout(60);

    if (contract && methodName && scArgs) {
      builder.addOperation(contract.call(methodName, ...scArgs));
    }
    if (operations) {
      builder.addOperation(operations);
    }
    return builder.build();
  }

  public getPublicKeyForCurrentNetwork(): string {
    const publicKeyMap: { [key: string]: string | undefined } = {
      [NETWORK.SOROBAN_TESTNET]: process.env.PUBLIC_KEY_TESTNET,
      [NETWORK.SOROBAN_FUTURENET]: process.env.PUBLIC_KEY_FUTURENET,
      [NETWORK.SOROBAN_MAINNET]: process.env.PUBLIC_KEY_MAINNET,
    };
    const publicKey = publicKeyMap[this.currentNetwork];
    if (!publicKey) {
      throw new Error('Network not supported or public key not configured');
    }
    return publicKey;
  }
  public async streamTransactionsByMemoId(
    publicKey: string,
    memoId?: string,
  ): Promise<void> {
    try {
      this.stellarServer
        .transactions()
        .forAccount(publicKey)
        .cursor('now')
        .stream({
          onmessage: async (
            transaction: StellarServer.Horizon.ServerApi.TransactionRecord,
          ) => {
            const _transaction =
              transaction as unknown as StellarServer.Horizon.HorizonApi.TransactionResponse;
            if (
              _transaction.memo &&
              (memoId === undefined || _transaction.memo === memoId)
            ) {
              const operationDetails = await this.getOperationDetails(
                _transaction.id,
              );
              const amounts: string[] = operationDetails
                .filter((op: Operation) => op.type === 'payment')
                .map((op: Operation.Payment) => op.amount);
              await this.updateUserBalance(_transaction.memo, amounts);
            }
          },
          onerror: (error) => {
            console.error(error);
          },
        });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  private async getOperationDetails(
    transactionId: string,
  ): Promise<Operation[]> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.stellarServer.serverURL}transactions/${transactionId}/operations`,
        ),
      );
      return response.data._embedded.records;
    } catch (error) {
      console.error(error.message);
      throw new NotFoundException(
        'Could not find transaction with provided transactionId.',
      );
    }
  }

  private async updateUserBalance(
    memoId: string,
    amounts: string[],
  ): Promise<void> {
    if (!memoId) {
      console.warn('MemoID is required to update user balance.');
      return;
    }
    const user = await this.userRepository.findByMemoId(memoId);
    if (!user) {
      console.error('User not found with MemoID:', memoId);
      return;
    }
    const totalAmount = amounts.reduce(
      (sum, amount) => sum + parseFloat(amount),
      0,
    );
    user.balance += totalAmount;
    await this.userRepository.update(user.id, user);
    console.log(`User balance updated. New balance: ${user.balance}`);
    console.log(`Notified balance update to clients...`);
  }

  public async getAccountOrFund(
    publicKey: string,
    userId: string,
  ): Promise<Account> {
    try {
      if (!this.server.getAccount) {
        await this.changeNetwork(NETWORK.SOROBAN_EPHEMERAL, userId);
      }
      return await this.server.getAccount(publicKey);
    } catch (error) {
      if (error.code === 404) {
        if (this.networkPassphrase === Networks.PUBLIC) {
          throw new NotFoundException(
            ErrorMessages.ACCOUNT_NOT_FOUND_ON_MAINNET,
          );
        }
        await this.fundAccount(publicKey, userId);
        return await this.server.getAccount(publicKey);
      }
      throw error;
    }
  }

  private async fundAccount(publicKey: string, userId: string): Promise<void> {
    const isEphemeral = (
      await this.ephemeralEnvironmentService.getTaskStatus(userId)
    ).payload;
    const url = `http://${isEphemeral.publicIp}:8000/?addr=`;
    const friendbotUrl = `${
      this.networkPassphrase === Networks.TESTNET
        ? SOROBAN_SERVER.FRIENDBOT_TESNET
        : this.networkPassphrase === Networks.STANDALONE
        ? url
        : SOROBAN_SERVER.FRIENDBOT_FUTURENET
    }${publicKey}`;
    const response = await fetch(friendbotUrl);
    if (!response.ok) {
      throw new InternalServerErrorException(
        ErrorMessages.FAILED_TO_FUND_ACCOUNT,
      );
    }
  }

  public createDeployContractOperation(
    response: rpc.Api.GetSuccessfulTransactionResponse,
    sourceKeypair: Keypair | string,
  ): xdr.Operation<Operation.InvokeHostFunction> {
    return Operation.createCustomContract({
      wasmHash: response.returnValue.bytes(),
      address: Address.fromString(
        sourceKeypair instanceof Keypair
          ? sourceKeypair?.publicKey()
          : sourceKeypair,
      ),
      salt: Buffer.from(randomBytes(32)),
    });
  }

  public extractContractAddress(
    responseDeploy: rpc.Api.GetSuccessfulTransactionResponse,
  ): string {
    return StrKey.encodeContract(
      Address.fromScAddress(responseDeploy.returnValue.address()).toBuffer(),
    );
  }
  private setNetwork(network: string): void {
    const config = this.networkConfig[network];
    if (config) {
      this.server = config.server;
      this.networkPassphrase = config.networkPassphrase;
      this.stellarServer = config.horizonServer;
      this.currentNetwork = network;
    }
  }

  private handleError(error: Error): void {
    this.responseService.errorHandler({ type: 'INTERNAL_SERVER_ERROR', error });
  }

  private async wrapWithErrorHandling<T>(fn: () => T | Promise<T>): Promise<T> {
    try {
      const response = await fn();
      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private createInstanceKey(contractId: string): xdr.LedgerKey {
    return xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: new Address(contractId).toScAddress(),
        key: xdr.ScVal.scvLedgerKeyContractInstance(),
        durability: xdr.ContractDataDurability.persistent(),
      }),
    );
  }

  private createWasmCodeKey(instance: xdr.ContractExecutable): xdr.LedgerKey {
    return xdr.LedgerKey.contractCode(
      new xdr.LedgerKeyContractCode({ hash: instance.wasmHash() }),
    );
  }

  private extractExecutableFromLedgerResponse(
    response: rpc.Api.GetLedgerEntriesResponse,
  ): xdr.ContractExecutable {
    return response.entries[0].val.contractData().val().instance().executable();
  }

  private calculateStartLedger(sequence: number): number {
    return sequence - 9999;
  }

  public async executeTransactionWithRetry(
    transaction: Transaction,
  ): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
    const hash = (await this.server.sendTransaction(transaction)).hash;
    let response: GetTransactionResponse;
    do {
      response = await this.server.getTransaction(hash);
      if (response.status !== GetTransactionStatus.NOT_FOUND) break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } while (true);

    if (response.status !== GetTransactionStatus.SUCCESS) {
      throw new Error('Transaction failed');
    }
    return response;
  }

  private async fetchFromServer(method: string, ...args: any[]): Promise<any> {
    return await this.server[method](...args);
  }

  public async checkContractNetwork(contractId: string): Promise<NETWORK> {
    return await this.wrapWithErrorHandling(async () => {
      const networks: NETWORK[] = [
        NETWORK.SOROBAN_FUTURENET,
        NETWORK.SOROBAN_TESTNET,
        NETWORK.SOROBAN_MAINNET,
      ];
      return await this.findNetworkWithContract(contractId, networks);
    });
  }

  private async findNetworkWithContract(
    contractId: string,
    networks: NETWORK[],
  ): Promise<NETWORK> {
    for (const network of networks) {
      this.setNetwork(network);
      const response = await this.fetchFromServer(
        'getLedgerEntries',
        this.createInstanceKey(contractId),
      );
      if (response.entries.length > 0) return network;
    }
    throw new BadRequestException(SOROBAN_CONTRACT_ERROR.NO_ENTRIES_FOUND);
  }
}
