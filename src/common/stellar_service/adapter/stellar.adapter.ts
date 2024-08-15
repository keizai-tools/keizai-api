import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  Networks,
  SorobanRpc,
  Transaction,
  TransactionBuilder,
  contract,
  xdr,
} from '@stellar/stellar-sdk';

import {
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';

import {
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
  private server: SorobanRpc.Server;
  private networkPassphrase: string;

  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
  ) {
    this.responseService.setContext(StellarAdapter.name);
    this.server = new SorobanRpc.Server(SOROBAN_SERVER.FUTURENET);
    this.networkPassphrase = Networks.FUTURENET;
  }

  changeNetwork(selectedNetwork: string): void {
    try {
      const networkConfig = {
        [NETWORK.SOROBAN_FUTURENET]: {
          server: new SorobanRpc.Server(SOROBAN_SERVER.FUTURENET),
          networkPassphrase: Networks.FUTURENET,
        },
        [NETWORK.SOROBAN_TESTNET]: {
          server: new SorobanRpc.Server(SOROBAN_SERVER.TESTNET),
          networkPassphrase: Networks.TESTNET,
        },
        [NETWORK.SOROBAN_MAINNET]: {
          server: new SorobanRpc.Server(SOROBAN_SERVER.MAINNET),
          networkPassphrase: Networks.PUBLIC,
        },
      };

      const config = networkConfig[selectedNetwork];
      if (config) {
        this.server = config.server;
        this.networkPassphrase = config.networkPassphrase;
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  getContractSpec(entries: xdr.ScSpecEntry[]): contract.Spec {
    try {
      return new contract.Spec(entries);
    } catch (error) {
      this.handleError(error);
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
      this.handleError(error);
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
      this.handleError(error);
    }
  }

  async contractExists(
    contractId: string,
    currentNetwork: string,
  ): Promise<SorobanRpc.Api.GetLedgerEntriesResponse> {
    try {
      if (currentNetwork === 'AUTO_DETECT') {
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
      this.handleError(error);
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
      this.handleError(error);
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
      this.handleError(error);
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
      this.handleError(error);
    }
  }

  async prepareTransaction(
    publicKey: string,
    contractId: string,
    methodName: string,
    scArgs: xdr.ScVal[],
  ): Promise<Transaction> {
    try {
      const account = await this.server.getAccount(publicKey);
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
      this.handleError(error);
    }
  }

  signTransaction(tx: Transaction, secretKey: string): void {
    try {
      return tx.sign(Keypair.fromSecret(secretKey));
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTransaction(hash: string): Promise<GetTransactionResponse> {
    try {
      return await this.server.getTransaction(hash);
    } catch (error) {
      this.handleError(error);
    }
  }

  async rawSendTransaction(
    tx: Transaction,
  ): Promise<RawSendTransactionResponse> {
    try {
      return await this.server._sendTransaction(tx);
    } catch (error) {
      this.handleError(error);
    }
  }

  async rawGetTransaction(hash: string): Promise<RawGetTransactionResponse> {
    try {
      return await this.server._getTransaction(hash);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: Error): void {
    this.responseService.errorHandler({
      type: 'INTERNAL_SERVER_ERROR',
      error,
    });
  }
}
