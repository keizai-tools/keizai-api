import {
  type Account,
  type Keypair,
  type Operation,
  Transaction,
  contract,
  type rpc,
  xdr,
} from '@stellar/stellar-sdk';

import type { NETWORK } from '../domain/soroban.enum';
import {
  EncodeEvent,
  GetTransactionResponse,
  RawGetTransactionResponse,
  RawSendTransactionResponse,
} from './soroban';

export const CONTRACT_ADAPTER = 'CONTRACT_ADAPTER';

export interface InputPrepareTransaction {
  publicKey: string;
  operations?: xdr.Operation<Operation.InvokeHostFunction>;
  contractId?: string;
  methodName?: string;
  scArgs?: xdr.ScVal[];
}

export interface IStellarAdapter {
  changeNetwork(selectedNetwork: NETWORK, userId?: string): void;
  checkContractNetwork(contractId: string, userId: string): Promise<NETWORK>;
  prepareTransaction(
    account: Account | string,
    userId: string,
    operationsOrContractId?:
      | xdr.Operation<Operation.InvokeHostFunction>
      | { contractId: string; methodName: string; scArgs: xdr.ScVal[] },
  ): Promise<Transaction>;
  getKeypair(secretKey: string): Keypair;
  signTransaction(transaction: Transaction, sourceKeypair: Keypair): void;
  sendTransaction(
    transaction: Transaction,
    useRaw: boolean,
  ): Promise<RawSendTransactionResponse | rpc.Api.SendTransactionResponse>;
  getContractEvents(contractId: string): Promise<EncodeEvent[]>;
  getTransaction(
    hash: string,
    useRaw: boolean,
  ): Promise<RawGetTransactionResponse | GetTransactionResponse>;
  getScSpecEntryFromXDR(input: Uint8Array): xdr.ScSpecEntry;
  getWasmCode(instance: xdr.ContractExecutable): Promise<Buffer>;
  createContractSpec(entries: xdr.ScSpecEntry[]): Promise<contract.Spec>;
  uploadWasm(
    file: Express.Multer.File,
    userId: string,
    publicKey: string,
    secretKey?: string,
  ): Promise<string>;
  executeTransactionWithRetry(
    transaction: Transaction,
  ): Promise<rpc.Api.GetSuccessfulTransactionResponse>;
  createDeployContractOperation(
    response: rpc.Api.GetSuccessfulTransactionResponse,
    sourceKeypair: Keypair | string,
  ): xdr.Operation<Operation.InvokeHostFunction>;
  prepareUploadWASM(
    file: Express.Multer.File,
    publicKey: string,
    userId: string,
  ): Promise<string>;
  extractContractAddress(
    responseDeploy: rpc.Api.GetSuccessfulTransactionResponse,
  ): string;
  getAccountOrFund(publicKey: string, userId: string): Promise<Account>;
  contractExists(
    contractId: string,
    currentNetwork: string,
    userId: string,
  ): Promise<rpc.Api.GetLedgerEntriesResponse>;
  getInstanceValue(
    contractId: string,
    currentNetwork: string,
    userId: string,
  ): Promise<xdr.ContractExecutable>;
}
