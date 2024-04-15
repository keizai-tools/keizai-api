import { ContractSpec, Transaction, xdr } from '@stellar/stellar-sdk';

import {
  EncodeEvent,
  RawGetTransactionResponse,
  RawSendTransactionResponse,
} from '../types/soroban';

export interface IStellarAdapter {
  changeNetwork(selectedNetwork: string): void;
  getContractSpec(specEntries: xdr.ScSpecEntry[]): ContractSpec;
  getScSpecEntryFromXDR(input: string): xdr.ScSpecEntry;
  getInstanceValue(contractId: string): Promise<xdr.ContractExecutable>;
  getWasmCode(instance: xdr.ContractExecutable): Promise<Buffer>;
  getContractEvents(contractId: string): Promise<EncodeEvent[]>;
  prepareTransaction(
    publicKey: string,
    contractId: string,
    methodName: string,
    scArgs: xdr.ScVal[],
  ): Promise<Transaction>;
  signTransaction(tx: Transaction, secretKey: string): void;
  rawSendTransaction(tx: Transaction): Promise<RawSendTransactionResponse>;
  rawGetTransaction(hash: string): Promise<RawGetTransactionResponse>;
}
