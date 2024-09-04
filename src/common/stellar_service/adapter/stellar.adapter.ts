import {
  BadRequestException,
  HttpException,
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
  FeeBumpTransaction,
  Keypair,
  Networks,
  SorobanRpc,
  Transaction,
  TransactionBuilder,
  contract,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk';

import {
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';

import {
  ContractMethods,
  ErrorMessages,
  NETWORK,
  SOROBAN_CONTRACT_ERROR,
  SOROBAN_SERVER,
  SendTransactionStatus,
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
  private server: SorobanRpc.Server;
  private networkPassphrase: string;
  private deployerContractId: string;

  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
  ) {
    this.responseService.setContext(StellarAdapter.name);
    this.server = new SorobanRpc.Server(SOROBAN_SERVER.FUTURENET);
    this.networkPassphrase = Networks.FUTURENET;
    this.deployerContractId =
      process.env.STELLAR_FUTURENET_SOROBAN_DEPLOYER_CONTRACT_ID;
  }

  changeNetwork(selectedNetwork: string): void {
    try {
      const networkConfig = {
        [NETWORK.SOROBAN_FUTURENET]: {
          server: new SorobanRpc.Server(SOROBAN_SERVER.FUTURENET),
          networkPassphrase: Networks.FUTURENET,
          deployerContractId:
            process.env.STELLAR_FUTURENET_SOROBAN_DEPLOYER_CONTRACT_ID,
        },
        [NETWORK.SOROBAN_TESTNET]: {
          server: new SorobanRpc.Server(SOROBAN_SERVER.TESTNET),
          networkPassphrase: Networks.TESTNET,
          deployerContractId:
            process.env.STELLAR_TESTNET_SOROBAN_DEPLOYER_CONTRACT_ID,
        },
        [NETWORK.SOROBAN_MAINNET]: {
          server: new SorobanRpc.Server(SOROBAN_SERVER.MAINNET),
          networkPassphrase: Networks.PUBLIC,
          deployerContractId:
            process.env.STELLAR_MAINNET_SOROBAN_DEPLOYER_CONTRACT_ID,
        },
      };

      const config = networkConfig[selectedNetwork];
      if (config) {
        this.server = config.server;
        this.networkPassphrase = config.networkPassphrase;
        this.deployerContractId = config.deployerContractId;
      }
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  getContractSpec(entries: xdr.ScSpecEntry[]): contract.Spec {
    try {
      return new contract.Spec(entries);
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  getScSpecEntryFromXDR(input: Uint8Array): xdr.ScSpecEntry {
    const base64String = Buffer.from(input).toString('base64');
    return xdr.ScSpecEntry.fromXDR(base64String, 'base64');
  }

  createInstanceKey(contractId: string): xdr.LedgerKey {
    try {
      return xdr.LedgerKey.contractData(
        new xdr.LedgerKeyContractData({
          contract: new Address(contractId).toScAddress(),
          key: xdr.ScVal.scvLedgerKeyContractInstance(),
          durability: xdr.ContractDataDurability.persistent(),
        }),
      );
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  async checkContractNetwork(contractId: string): Promise<string> {
    try {
      const networks = [
        NETWORK.SOROBAN_FUTURENET,
        NETWORK.SOROBAN_TESTNET,
        NETWORK.SOROBAN_MAINNET,
      ];

      for (const network of networks) {
        this.changeNetwork(network);
        const instanceKey = this.createInstanceKey(contractId);
        const response = await this.server.getLedgerEntries(instanceKey);
        if (response.entries.length > 0) {
          return network;
        }
      }

      throw new BadRequestException(SOROBAN_CONTRACT_ERROR.NO_ENTRIES_FOUND);
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  async contractExists(
    contractId: string,
    currentNetwork: string,
  ): Promise<SorobanRpc.Api.GetLedgerEntriesResponse> {
    try {
      if (currentNetwork === NETWORK.SOROBAN_AUTO_DETECT) {
        const network = await this.checkContractNetwork(contractId);
        this.changeNetwork(network);
        const instanceKey = this.createInstanceKey(contractId);
        const response = await this.server.getLedgerEntries(instanceKey);
        if (response.entries.length > 0) {
          return response;
        }
        throw new BadRequestException(SOROBAN_CONTRACT_ERROR.NO_ENTRIES_FOUND);
      } else {
        const instanceKey = this.createInstanceKey(contractId);
        const response = await this.server.getLedgerEntries(instanceKey);
        if (response.entries.length === 0) {
          throw new BadRequestException(
            SOROBAN_CONTRACT_ERROR.NO_ENTRIES_FOUND,
          );
        }
        return response;
      }
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  async getInstanceValue(
    contractId: string,
    currentNetwork: string,
  ): Promise<xdr.ContractExecutable> {
    try {
      const response = await this.contractExists(contractId, currentNetwork);

      return response.entries[0].val
        .contractData()
        .val()
        .instance()
        .executable();
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  async getWasmCode(instance: xdr.ContractExecutable): Promise<Buffer> {
    try {
      const codeKey = xdr.LedgerKey.contractCode(
        new xdr.LedgerKeyContractCode({
          hash: instance.wasmHash(),
        }),
      );
      const response = await this.server.getLedgerEntries(codeKey);

      if (response.entries.length === 0) {
        throw new BadRequestException(SOROBAN_CONTRACT_ERROR.NO_ENTRIES_FOUND);
      }

      const wasmCode = response.entries[0].val.contractCode().code();
      return wasmCode;
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  async getContractEvents(contractId: string): Promise<EncodeEvent[]> {
    try {
      const oneDayEarlierLedger = 9999;
      const { sequence } = await this.server.getLatestLedger();
      const newStartLedger = sequence - oneDayEarlierLedger;

      const { events } = await this.server.getEvents({
        startLedger: newStartLedger,
        filters: [
          {
            contractIds: [contractId],
          },
        ],
        limit: 20,
      });
      return events.reverse();
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  async prepareTransaction(
    publicKey: string,
    contractId: string,
    methodName: string,
    scArgs: xdr.ScVal[],
  ): Promise<Transaction> {
    try {
      const account = await this.server
        .getAccount(publicKey)
        .catch(async (error) => {
          if (error.code === 404) {
            if (this.networkPassphrase === Networks.PUBLIC) {
              throw new NotFoundException(
                ErrorMessages.ACCOUNT_NOT_FOUND_ON_MAINNET,
              );
            }

            const friendbotUrl = `${
              this.networkPassphrase === Networks.TESTNET
                ? SOROBAN_SERVER.FRIENDBOT_TESNET
                : SOROBAN_SERVER.FRIENDBOT_FUTURENET
            }${publicKey}`;
            const response = await fetch(friendbotUrl);
            if (!response.ok) {
              throw new InternalServerErrorException(
                ErrorMessages.FAILED_TO_FUND_ACCOUNT,
              );
            }
            return await this.server.getAccount(publicKey);
          }
          throw error;
        });

      const contract = new Contract(contractId);
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call(methodName, ...scArgs))
        .setTimeout(60)
        .build();

      return await this.server.prepareTransaction(transaction);
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  signTransaction(tx: Transaction, secretKey: string): void {
    try {
      return tx.sign(Keypair.fromSecret(secretKey));
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  async getAccount(publicKey: string): Promise<Account> {
    try {
      return await this.server.getAccount(publicKey);
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  async getTransaction(hash: string): Promise<GetTransactionResponse> {
    try {
      return await this.server.getTransaction(hash);
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  async rawSendTransaction(
    tx: Transaction,
  ): Promise<RawSendTransactionResponse> {
    try {
      return await this.server._sendTransaction(tx);
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  async rawGetTransaction(hash: string): Promise<RawGetTransactionResponse> {
    try {
      return await this.server._getTransaction(hash);
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  async prepareTransactionSimulation(tx: Transaction): Promise<Transaction> {
    return await this.server.prepareTransaction(tx);
  }

  async buildInvokeTransaction(
    invokeOperation: xdr.Operation,
    adminKeypair: Keypair,
  ) {
    try {
      const account = await this.server.getAccount(adminKeypair.publicKey());

      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(invokeOperation)
        .setTimeout(30)
        .build();

      return transaction;
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  async submitTransaction(
    transaction: Transaction | FeeBumpTransaction,
  ): Promise<string> {
    try {
      const { hash, status } = await this.server.sendTransaction(transaction);

      if (status === SendTransactionStatus.ERROR) {
        throw new InternalServerErrorException(
          ErrorMessages.ERROR_SENDING_TRANSACTION,
        );
      }

      const transactionDetails = await this.getTransactionDetails(hash);

      if (
        transactionDetails.status === SorobanRpc.Api.GetTransactionStatus.FAILED
      ) {
        throw new InternalServerErrorException(
          `${JSON.stringify(transactionDetails.resultXdr)}`,
        );
      }

      if (
        transactionDetails.status ===
        SorobanRpc.Api.GetTransactionStatus.SUCCESS
      ) {
        return scValToNative(
          transactionDetails.resultMetaXdr.v3().sorobanMeta().returnValue(),
        );
      }
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  async getTransactionDetails(
    transactionHash: string,
  ): Promise<SorobanRpc.Api.GetTransactionResponse> {
    try {
      const TIMEOUT = 1000;
      const MAX_RETRIES = 10;
      let transactionDetails: SorobanRpc.Api.GetTransactionResponse;
      let count = 0;

      do {
        if (count > MAX_RETRIES) {
          throw new NotFoundException(ErrorMessages.TRANSACTION_NOT_FOUND);
        }

        transactionDetails = await this.server.getTransaction(transactionHash);

        count++;

        await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
      } while (
        transactionDetails.status ===
        SorobanRpc.Api.GetTransactionStatus.NOT_FOUND
      );

      return transactionDetails;
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  async prepareUploadWASM(
    file: Express.Multer.File,
    publicKey: string,
  ): Promise<string> {
    try {
      const deployer = new Address(publicKey);
      const scArgs = [
        deployer.toScVal(),
        xdr.ScVal.scvBytes(file.buffer),
        xdr.ScVal.scvBytes(Buffer.alloc(32, Date.now())),
      ];

      const transaction = await this.prepareTransaction(
        publicKey,
        this.deployerContractId,
        ContractMethods.DEPLOY,
        scArgs,
      );

      return transaction.toXDR();
    } catch (error) {
      if (error instanceof HttpException) this.handleError(error);
      else this.handleError(error.message);
    }
  }

  private handleError(error: Error): void {
    this.responseService.errorHandler({
      type: 'INTERNAL_SERVER_ERROR',
      error,
    });
  }
}
