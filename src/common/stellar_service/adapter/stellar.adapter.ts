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
  FILE_UPLOAD_SERVICE,
  IFileUploadService,
} from '@/common/S3/interface/file_upload.s3.interface';
import { ENVIRONMENT } from '@/common/base/enum/common.enum';
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
  public currentNetwork: NETWORK;
  private server: rpc.Server;
  private networkPassphrase: string;
  private stellarServer: StellarServer.Horizon.Server;
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
    private readonly httpService: HttpService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(EPHEMERAL_ENVIRONMENT_SERVICE)
    private readonly ephemeralEnvironmentService: EphemeralEnvironmentService,
    @Inject(FILE_UPLOAD_SERVICE)
    private readonly fileUploadService: IFileUploadService,
  ) {
    this.responseService.setContext(StellarAdapter.name);
    this.setNetwork({ network: NETWORK.SOROBAN_FUTURENET });
  }

  public async verifyNetwork({
    selectedNetwork,
    contractId,
    userId,
  }: {
    selectedNetwork: NETWORK;
    contractId?: string;
    userId: string;
  }): Promise<NETWORK> {
    await this.changeNetwork({ selectedNetwork, userId });
    if (
      selectedNetwork !== this.currentNetwork ||
      selectedNetwork === NETWORK.SOROBAN_EPHEMERAL
    ) {
      await this.changeNetwork({ selectedNetwork, userId });
      this.currentNetwork = selectedNetwork;
    }

    if (selectedNetwork === NETWORK.SOROBAN_AUTO_DETECT && contractId) {
      const response = await this.checkContractNetwork({
        contractId,
        currentNetwork: selectedNetwork,
        userId,
      });
      this.currentNetwork = response;
    }

    return this.currentNetwork;
  }

  public async changeNetwork({
    selectedNetwork,
    userId,
  }: {
    selectedNetwork: NETWORK;
    userId: string;
  }): Promise<void> {
    await this.wrapWithErrorHandling({
      fn: async () => {
        if (selectedNetwork === NETWORK.SOROBAN_EPHEMERAL) {
          await this.validateEphemeralNetwork({
            network: selectedNetwork,
            userId,
          });
        }
        await this.setNetwork({ network: selectedNetwork });
      },
    });
  }

  public getScSpecEntryFromXDR({
    input,
  }: {
    input: Uint8Array;
  }): xdr.ScSpecEntry {
    return xdr.ScSpecEntry.fromXDR(
      Buffer.from(input).toString('base64'),
      'base64',
    );
  }

  public createContractSpec({
    entries,
  }: {
    entries: xdr.ScSpecEntry[];
  }): Promise<contract.Spec> {
    return this.wrapWithErrorHandling({ fn: () => new contract.Spec(entries) });
  }

  public async contractExists({
    contractId,
    currentNetwork,
    userId,
  }: {
    contractId: string;
    currentNetwork: NETWORK;
    userId: string;
  }): Promise<rpc.Api.GetLedgerEntriesResponse> {
    await this.changeNetwork({ selectedNetwork: currentNetwork, userId });
    return await this.wrapWithErrorHandling({
      fn: async () => {
        const network =
          currentNetwork === NETWORK.SOROBAN_AUTO_DETECT
            ? await this.checkContractNetwork({
                contractId,
                currentNetwork,
                userId,
              })
            : currentNetwork;
        await this.changeNetwork({ selectedNetwork: network, userId });
        return await this.fetchFromServer({
          method: 'getLedgerEntries',
          args: [this.createInstanceKey({ contractId })],
        });
      },
    });
  }

  public async getInstanceValue({
    contractId,
    currentNetwork,
    userId,
  }: {
    contractId: string;
    currentNetwork: NETWORK;
    userId: string;
  }): Promise<xdr.ContractExecutable> {
    await this.changeNetwork({ selectedNetwork: currentNetwork, userId });
    return await this.wrapWithErrorHandling({
      fn: async () => {
        const response = await this.contractExists({
          contractId,
          currentNetwork,
          userId,
        });
        return this.extractExecutableFromLedgerResponse({ response });
      },
    });
  }

  public async getWasmCode({
    instance,
    currentNetwork,
    userId,
  }: {
    instance: xdr.ContractExecutable;
    currentNetwork: NETWORK;
    userId: string;
  }): Promise<Buffer> {
    await this.changeNetwork({ selectedNetwork: currentNetwork, userId });
    return await this.wrapWithErrorHandling({
      fn: async () => {
        const codeKey = this.createWasmCodeKey({ instance });
        return await this.fetchFromServer({
          method: 'getLedgerEntries',
          args: [codeKey],
        }).then((response) => {
          if (
            response.entries.length === 0 ||
            !response.entries[0]?.val?.contractCode
          ) {
            throw new BadRequestException(
              SOROBAN_CONTRACT_ERROR.NO_ENTRIES_FOUND,
            );
          }
          return response.entries[0].val.contractCode().code();
        });
      },
    });
  }

  public async getContractEvents({
    contractId,
    currentNetwork,
    userId,
  }: {
    contractId: string;
    currentNetwork: NETWORK;
    userId: string;
  }): Promise<EncodeEvent[]> {
    await this.changeNetwork({ selectedNetwork: currentNetwork, userId });
    return await this.wrapWithErrorHandling({
      fn: async () => {
        const sequence = await this.fetchFromServer({
          method: 'getLatestLedger',
        });

        let startLedger = sequence.sequence - 9999;

        try {
          await this.fetchFromServer({
            method: 'getEvents',
            args: [
              {
                startLedger: 1,
                filters: [{ contractIds: [contractId] }],
                limit: 1,
              },
            ],
          });
        } catch (error) {
          const match = error.message.match(
            /startLedger must be within the ledger range: (\d+) - (\d+)/,
          );
          if (match) {
            const oldestLedger = parseInt(match[1], 10);
            const latestLedger = parseInt(match[2], 10);

            if (startLedger < oldestLedger) {
              startLedger = oldestLedger;
            } else if (startLedger > latestLedger) {
              startLedger = latestLedger;
            }
          } else {
            throw error;
          }
        }

        const { events } = await this.fetchFromServer({
          method: 'getEvents',
          args: [
            {
              startLedger,
              filters: [{ contractIds: [contractId] }],
            },
          ],
        });

        return events.reverse();
      },
    });
  }

  public getKeypair({ secretKey }: { secretKey: string }): Keypair {
    return Keypair.fromSecret(secretKey);
  }

  public async sendTransaction({
    transaction,
    currentNetwork,
    userId,
    useRaw = false,
  }: {
    transaction: Transaction;
    currentNetwork: NETWORK;
    userId: string;
    useRaw?: boolean;
  }): Promise<RawSendTransactionResponse | rpc.Api.SendTransactionResponse> {
    await this.changeNetwork({ selectedNetwork: currentNetwork, userId });
    return await this.wrapWithErrorHandling({
      fn: async () => {
        return useRaw
          ? await this.fetchFromServer({
              method: '_sendTransaction',
              args: [transaction],
            })
          : await this.fetchFromServer({
              method: 'sendTransaction',
              args: [transaction],
            });
      },
    });
  }

  public async getTransaction({
    hash,
    currentNetwork,
    userId,
    useRaw = false,
  }: {
    hash: string;
    currentNetwork: NETWORK;
    userId: string;
    useRaw?: boolean;
  }): Promise<RawGetTransactionResponse | GetTransactionResponse> {
    await this.changeNetwork({ selectedNetwork: currentNetwork, userId });
    return await this.wrapWithErrorHandling({
      fn: async () => {
        return useRaw
          ? await this.fetchFromServer({
              method: '_getTransaction',
              args: [hash],
            })
          : await this.fetchFromServer({
              method: 'getTransaction',
              args: [hash],
            });
      },
    });
  }

  public async uploadWasm({
    file,
    currentNetwork,
    userId,
    publicKey,
    secretKey,
  }: {
    file: Express.Multer.File;
    currentNetwork: NETWORK;
    userId: string;
    publicKey: string;
    secretKey?: string;
  }): Promise<string> {
    await this.changeNetwork({ selectedNetwork: currentNetwork, userId });
    return await this.wrapWithErrorHandling({
      fn: async () => {
        const uploadResponse = await this.fileUploadService.uploadFile({
          file,
          userId,
        });

        if (!uploadResponse.payload) {
          throw new BadRequestException('Error uploading the Wasm file to S3');
        }

        const operation = Operation.uploadContractWasm({ wasm: file.buffer });

        if (!this.getAccountOrFund) {
          await this.changeNetwork({
            selectedNetwork: NETWORK.SOROBAN_EPHEMERAL,
            userId,
          });
        }

        const account = await this.getAccountOrFund({
          publicKey,
          currentNetwork,
          userId,
        });
        const preparedTx = await this.prepareTransaction({
          account,
          currentNetwork,
          userId,
          operationsOrContractId: operation,
        });

        if (secretKey) {
          const sourceKeypair = Keypair.fromSecret(secretKey);
          this.signTransaction({ transaction: preparedTx, sourceKeypair });
          const response = await this.executeTransactionWithRetry({
            transaction: preparedTx,
          });
          return await this.deployContract({
            response,
            currentNetwork,
            sourceKeypair,
            userId,
          });
        } else {
          return preparedTx.toXDR();
        }
      },
    });
  }

  public async deployContract({
    response,
    currentNetwork,
    sourceKeypair,
    userId,
  }: {
    response: rpc.Api.GetSuccessfulTransactionResponse;
    currentNetwork: NETWORK;
    sourceKeypair: Keypair;
    userId: string;
  }): Promise<string> {
    await this.changeNetwork({ selectedNetwork: currentNetwork, userId });
    return await this.wrapWithErrorHandling({
      fn: async () => {
        const account = await this.getAccountOrFund({
          publicKey: sourceKeypair.publicKey(),
          currentNetwork,
          userId,
        });
        const operation = this.createDeployContractOperation({
          response,
          sourceKeypair,
        });

        const responseDeploy: rpc.Api.GetSuccessfulTransactionResponse =
          await this.buildAndSendTransaction({
            account,
            operations: operation,
            sourceKeypair,
            currentNetwork,
            userId,
          });
        return this.extractContractAddress({ responseDeploy });
      },
    });
  }

  public async submitSignedTransaction({
    signedXdr,
    currentNetwork,
    userId,
  }: {
    signedXdr: string;
    currentNetwork: NETWORK;
    userId: string;
  }): Promise<rpc.Api.SendTransactionResponse> {
    await this.changeNetwork({ selectedNetwork: currentNetwork, userId });
    return await this.wrapWithErrorHandling({
      fn: async () => {
        const transaction = TransactionBuilder.fromXDR(
          signedXdr,
          this.networkPassphrase,
        );
        const response: rpc.Api.SendTransactionResponse =
          await this.server.sendTransaction(transaction);
        return response;
      },
    });
  }

  public async prepareUploadWASM({
    file,
    currentNetwork,
    publicKey,
    userId,
  }: {
    file: Express.Multer.File;
    currentNetwork: NETWORK;
    publicKey: string;
    userId: string;
  }): Promise<string> {
    await this.changeNetwork({ selectedNetwork: currentNetwork, userId });
    try {
      await this.getAccountOrFund({ publicKey, currentNetwork, userId });
    } catch (error) {
      if (
        error instanceof NotFoundException &&
        error.message.includes('No running tasks found')
      ) {
        this.responseService.warn(
          'No running tasks found, continuing without funding account.',
        );
      } else {
        throw error;
      }
    }

    return await this.wrapWithErrorHandling({
      fn: async (): Promise<string> => {
        const account: Account = await this.getAccountOrFund({
          publicKey,
          currentNetwork,
          userId,
        });
        const operation: xdr.Operation<Operation.InvokeHostFunction> =
          Operation.uploadContractWasm({
            wasm: file.buffer,
          });
        return (
          await this.prepareTransaction({
            account,
            currentNetwork,
            userId,
            operationsOrContractId: operation,
          })
        ).toXDR();
      },
    });
  }

  public signTransaction({
    transaction,
    sourceKeypair,
  }: {
    transaction: Transaction;
    sourceKeypair: Keypair;
  }): void {
    transaction.sign(sourceKeypair);
  }

  public async prepareTransaction({
    account,
    currentNetwork,
    userId,
    operationsOrContractId,
  }: {
    account: Account | string;
    currentNetwork: NETWORK;
    userId: string;
    operationsOrContractId?:
      | xdr.Operation<Operation.InvokeHostFunction>
      | { contractId: string; methodName: string; scArgs: xdr.ScVal[] };
  }): Promise<Transaction> {
    await this.changeNetwork({ selectedNetwork: currentNetwork, userId });
    return await this.wrapWithErrorHandling({
      fn: async () => {
        let transaction: Transaction;
        let memoObj: Memo;
        if (typeof account === 'string') {
          const publicKey = account;
          const { contractId, methodName, scArgs } = operationsOrContractId as {
            contractId: string;
            methodName: string;
            scArgs: xdr.ScVal[];
          };
          const accountObj = await this.getAccountOrFund({
            publicKey,
            currentNetwork,
            userId,
          });
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
      },
    });
  }

  public async streamTransactionsByMemoId({
    publicKey,
    currentNetwork,
    userId,
    memoId,
  }: {
    publicKey: string;
    currentNetwork?: NETWORK;
    userId?: string;
    memoId?: string;
  }): Promise<void> {
    await this.changeNetwork({ selectedNetwork: currentNetwork, userId });
    try {
      await this.changeNetwork({
        selectedNetwork:
          process.env.NODE_ENV === ENVIRONMENT.PRODUCTION
            ? NETWORK.SOROBAN_MAINNET
            : NETWORK.SOROBAN_FUTURENET,
        userId,
      });
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
              const operationDetails = await this.getOperationDetails({
                transactionId: _transaction.id,
              });
              const amounts: string[] = operationDetails
                .filter((op: Operation) => op.type === 'payment')
                .map((op: Operation.Payment) => op.amount);
              await this.updateUserBalance({
                memoId: _transaction.memo,
                amounts,
              });
            }
          },
          onerror: (error) => {
            this.responseService.error(error);
          },
        });
    } catch (error) {
      this.responseService.error(error);
      throw error;
    }
  }

  private async buildAndSendTransaction({
    account,
    operations,
    sourceKeypair,
    currentNetwork,
    userId,
  }: {
    account: Account;
    operations: xdr.Operation<Operation.InvokeHostFunction>;
    sourceKeypair: Keypair;
    currentNetwork: NETWORK;
    userId: string;
  }): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
    const preparedTx = await this.prepareTransaction({
      account,
      currentNetwork,
      userId,
      operationsOrContractId: operations,
    });
    this.signTransaction({ transaction: preparedTx, sourceKeypair });
    return await this.executeTransactionWithRetry({ transaction: preparedTx });
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

  private async getOperationDetails({
    transactionId,
  }: {
    transactionId: string;
  }): Promise<Operation[]> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.stellarServer.serverURL}transactions/${transactionId}/operations`,
        ),
      );
      return response.data._embedded.records;
    } catch (error) {
      this.responseService.error(error.message);
      throw new NotFoundException(
        'Could not find transaction with provided transactionId.',
      );
    }
  }

  private async validateEphemeralNetwork({
    network,
    userId,
  }: {
    network: NETWORK;
    userId: string;
  }) {
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
    const config: {
      server: rpc.Server;
      networkPassphrase: string;
      horizonServer: StellarServer.Horizon.Server;
    } = this.networkConfig[network];
    if (config) {
      this.server = config.server;
      this.networkPassphrase = config.networkPassphrase;
      this.stellarServer = config.horizonServer;
      this.currentNetwork = network;
    }
    if (!this.server) {
      throw new InternalServerErrorException('Server is not set');
    }
    return {
      taskArn: isEphemeral.taskArn,
      publicIp: isEphemeral.publicIp,
    };
  }

  private async setNetwork({ network }: { network: NETWORK }): Promise<void> {
    const config: {
      server: rpc.Server;
      networkPassphrase: string;
      horizonServer: StellarServer.Horizon.Server;
    } = this.networkConfig[network];
    if (config) {
      this.server = config.server;
      this.networkPassphrase = config.networkPassphrase;
      this.stellarServer = config.horizonServer;
      this.currentNetwork = network;
    }
  }

  private async updateUserBalance({
    memoId,
    amounts,
  }: {
    memoId: string;
    amounts: string[];
  }): Promise<void> {
    if (!memoId) {
      this.responseService.warn('MemoID is required to update user balance.');
      return;
    }
    const user = await this.userRepository.findByMemoId(memoId);
    if (!user) {
      throw new NotFoundException('User not found with MemoID:', memoId);
    }
    const totalAmount = amounts.reduce(
      (sum, amount) => sum + parseFloat(amount),
      0,
    );
    user.balance += totalAmount;
    await this.userRepository.update(user.id, user);
  }

  public async getAccountOrFund({
    publicKey,
    currentNetwork,
    userId,
  }: {
    publicKey: string;
    currentNetwork: NETWORK;
    userId: string;
  }): Promise<Account> {
    await this.changeNetwork({ selectedNetwork: currentNetwork, userId });
    try {
      return await this.server.getAccount(publicKey);
    } catch (error) {
      if (error.code === 404) {
        if (this.networkPassphrase === Networks.PUBLIC) {
          throw new NotFoundException(
            ErrorMessages.ACCOUNT_NOT_FOUND_ON_MAINNET,
          );
        }
        await this.fundAccount({ publicKey, currentNetwork, userId });
        return await this.server.getAccount(publicKey);
      }
      throw error;
    }
  }

  private async fundAccount({
    publicKey,
    currentNetwork,
    userId,
  }: {
    publicKey: string;
    currentNetwork: NETWORK;
    userId: string;
  }): Promise<void> {
    await this.changeNetwork({ selectedNetwork: currentNetwork, userId });
    if (this.currentNetwork === NETWORK.SOROBAN_EPHEMERAL)
      this.ephemeralEnvironmentService.getAccountOrFund(publicKey, userId);

    const urls = [
      `${SOROBAN_SERVER.FRIENDBOT_TESNET}${publicKey}`,
      `${SOROBAN_SERVER.FRIENDBOT_FUTURENET}${publicKey}`,
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return;
        }
      } catch (error) {
        this.responseService.warn(
          `Failed to fund account using URL: ${url}`,
          error,
        );
      }
    }

    throw new InternalServerErrorException(
      ErrorMessages.FAILED_TO_FUND_ACCOUNT,
    );
  }

  public createDeployContractOperation({
    response,
    sourceKeypair,
  }: {
    response: rpc.Api.GetSuccessfulTransactionResponse;
    sourceKeypair: Keypair | string;
  }): xdr.Operation<Operation.InvokeHostFunction> {
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

  public extractContractAddress({
    responseDeploy,
  }: {
    responseDeploy: rpc.Api.GetSuccessfulTransactionResponse;
  }): string {
    return StrKey.encodeContract(
      Address.fromScAddress(responseDeploy.returnValue.address()).toBuffer(),
    );
  }

  private handleError({ error }: { error: Error }): void {
    this.responseService.errorHandler({ type: 'INTERNAL_SERVER_ERROR', error });
  }

  private async wrapWithErrorHandling<T>({
    fn,
  }: {
    fn: () => T | Promise<T>;
  }): Promise<T> {
    try {
      const response = await fn();
      return response;
    } catch (error) {
      this.handleError({ error });
      throw error;
    }
  }

  private createInstanceKey({
    contractId,
  }: {
    contractId: string;
  }): xdr.LedgerKey {
    return xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: new Address(contractId).toScAddress(),
        key: xdr.ScVal.scvLedgerKeyContractInstance(),
        durability: xdr.ContractDataDurability.persistent(),
      }),
    );
  }

  private createWasmCodeKey({
    instance,
  }: {
    instance: xdr.ContractExecutable;
  }): xdr.LedgerKey {
    return xdr.LedgerKey.contractCode(
      new xdr.LedgerKeyContractCode({ hash: instance.wasmHash() }),
    );
  }

  private extractExecutableFromLedgerResponse({
    response,
  }: {
    response: rpc.Api.GetLedgerEntriesResponse;
  }): xdr.ContractExecutable {
    if (!response.entries[0]?.val?.contractData) {
      throw new InternalServerErrorException(
        'No contract data found in response',
      );
    }
    return response.entries[0].val.contractData().val().instance().executable();
  }

  public async executeTransactionWithRetry({
    transaction,
  }: {
    transaction: Transaction;
  }): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
    const hash = (await this.server.sendTransaction(transaction)).hash;
    let response: GetTransactionResponse;
    do {
      response = await this.server.getTransaction(hash);
      if (response.status !== GetTransactionStatus.NOT_FOUND) break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } while (true);

    if (response.status !== GetTransactionStatus.SUCCESS) {
      throw new InternalServerErrorException('Transaction failed');
    }
    return response;
  }

  private async fetchFromServer({
    method,
    args = [],
  }: {
    method: string;
    args?: any[];
  }): Promise<any> {
    if (!this.server) {
      throw new InternalServerErrorException('Server is not set');
    }
    const maxRetries = 5;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await this.server[method](...args);
      } catch (error) {
        if (
          error.message.includes(
            "Cannot read properties of null (reading 'getLedgerEntries')",
          )
        ) {
          attempt++;
          if (attempt >= maxRetries) {
            throw new InternalServerErrorException('Max retries reached');
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          throw error;
        }
      }
    }
  }

  public async checkContractNetwork({
    contractId,
    currentNetwork,
    userId,
  }: {
    contractId: string;
    currentNetwork: NETWORK;
    userId: string;
  }): Promise<NETWORK> {
    await this.changeNetwork({ selectedNetwork: currentNetwork, userId });
    return await this.wrapWithErrorHandling({
      fn: async () => {
        const networks: NETWORK[] = [
          NETWORK.SOROBAN_FUTURENET,
          NETWORK.SOROBAN_TESTNET,
          NETWORK.SOROBAN_MAINNET,
        ];
        return await this.findNetworkWithContract({
          contractId,
          networks,
          userId,
        });
      },
    });
  }

  private async findNetworkWithContract({
    contractId,
    networks,
    userId,
  }: {
    contractId: string;
    networks: NETWORK[];
    userId: string;
  }): Promise<NETWORK> {
    for (const network of networks) {
      await this.changeNetwork({ selectedNetwork: network, userId });
      const response = await this.fetchFromServer({
        method: 'getLedgerEntries',
        args: [this.createInstanceKey({ contractId })],
      });
      if (response.entries.length > 0) return network;
    }
    throw new BadRequestException(SOROBAN_CONTRACT_ERROR.NO_ENTRIES_FOUND);
  }
}
