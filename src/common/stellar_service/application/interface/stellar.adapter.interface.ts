import { Transaction, contract, xdr } from '@stellar/stellar-sdk';

import {
  EncodeEvent,
  GetTransactionResponse,
  RawGetTransactionResponse,
  RawSendTransactionResponse,
} from './soroban';

export const CONTRACT_ADAPTER = 'CONTRACT_ADAPTER';

export interface IStellarAdapter {
  changeNetwork(selectedNetwork: string): void;
  getContractSpec(specEntries: xdr.ScSpecEntry[]): contract.Spec;
  getScSpecEntryFromXDR(input: Uint8Array): xdr.ScSpecEntry;
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
  getTransaction(hash: string): Promise<GetTransactionResponse>;
}
