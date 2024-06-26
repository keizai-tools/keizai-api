import { Injectable, BadRequestException } from '@nestjs/common';
import {
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  Networks,
  SorobanRpc,
  TransactionBuilder,
  contract,
  xdr,
} from '@stellar/stellar-sdk';

import { IStellarAdapter } from '@/common/application/adapter/stellar.adapter.interface';
import {
  EncodeEvent,
  GetTransactionResponse,
  RawGetTransactionResponse,
  RawSendTransactionResponse,
  Transaction,
} from '@/common/application/types/soroban';
import {
  NETWORK,
  SOROBAN_CONTRACT_ERROR,
  SOROBAN_SERVER,
} from '@/common/application/types/soroban.enum';
import { ENVIROMENT_RESPONSE } from '@/modules/enviroment/application/exceptions/enviroment-response.enum';

@Injectable()
export class StellarAdapter implements IStellarAdapter {
  private server: SorobanRpc.Server;
  private networkPassphrase: string;

  constructor() {
    this.server = new SorobanRpc.Server(SOROBAN_SERVER.FUTURENET);
    this.networkPassphrase = Networks.FUTURENET;
  }

  changeNetwork(selectedNetwork: string): void {
    switch (selectedNetwork) {
      case NETWORK.SOROBAN_FUTURENET:
        this.server = new SorobanRpc.Server(SOROBAN_SERVER.FUTURENET);
        this.networkPassphrase = Networks.FUTURENET;
        break;
      case NETWORK.SOROBAN_TESTNET:
        this.server = new SorobanRpc.Server(SOROBAN_SERVER.TESTNET);
        this.networkPassphrase = Networks.TESTNET;
        break;
      case NETWORK.SOROBAN_MAINNET:
        this.server = new SorobanRpc.Server(SOROBAN_SERVER.MAINNET);
        this.networkPassphrase = Networks.PUBLIC;
        break;
    }
  }

  getContractSpec(entries: xdr.ScSpecEntry[]): contract.Spec {
    return new contract.Spec(entries);
  }

  getScSpecEntryFromXDR(input: string): xdr.ScSpecEntry {
    return xdr.ScSpecEntry.fromXDR(input, 'base64');
  }

  async getInstanceValue(contractId: string): Promise<xdr.ContractExecutable> {
    try {
      const instanceKey = xdr.LedgerKey.contractData(
        new xdr.LedgerKeyContractData({
          contract: new Address(contractId).toScAddress(),
          key: xdr.ScVal.scvLedgerKeyContractInstance(),
          durability: xdr.ContractDataDurability.persistent(),
        }),
      );
      const response = await this.server.getLedgerEntries(instanceKey);

      if (response.entries.length === 0) {
        throw new BadRequestException(SOROBAN_CONTRACT_ERROR.NO_ENTRIES_FOUND);
      }
      
      const dataEntry = response.entries[0].val
        .contractData()
        .val()
        .instance()
        .executable();
      return dataEntry;
    } catch (error) {
      console.log('Error while getting instance value: ', error);
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
      console.log('Error while getting wasm code: ', error);
    }
  }

  async getContractEvents(contractId: string): Promise<EncodeEvent[]> {
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
  }

  async prepareTransaction(
    publicKey: string,
    contractId: string,
    methodName: string,
    scArgs: xdr.ScVal[],
  ): Promise<Transaction> {
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
  }

  signTransaction(tx: Transaction, secretKey: string): void {
    return tx.sign(Keypair.fromSecret(secretKey));
  }

  async getTransaction(hash: string): Promise<GetTransactionResponse> {
    return await this.server.getTransaction(hash);
  }

  async rawSendTransaction(
    tx: Transaction,
  ): Promise<RawSendTransactionResponse> {
    return await this.server._sendTransaction(tx);
  }

  async rawGetTransaction(hash: string): Promise<RawGetTransactionResponse> {
    return await this.server._getTransaction(hash);
  }
}
