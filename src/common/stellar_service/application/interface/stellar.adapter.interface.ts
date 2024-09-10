import {
  type Account,
  type Keypair,
  type Operation,
  type SorobanRpc,
  Transaction,
  contract,
  xdr,
} from '@stellar/stellar-sdk';

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
  changeNetwork(selectedNetwork: string): void;
  checkContractNetwork(contractId: string): Promise<string>;
  getInstanceValue(
    contractId: string,
    currentNetwork: string,
  ): Promise<xdr.ContractExecutable>;
  prepareTransaction(
    account: Account | string,
    operationsOrContractId?:
      | xdr.Operation<Operation.InvokeHostFunction>
      | { contractId: string; methodName: string; scArgs: xdr.ScVal[] },
  ): Promise<Transaction>;
  getKeypair(secretKey: string): Keypair;
  signTransaction(transaction: Transaction, sourceKeypair: Keypair): void;
  sendTransaction(
    transaction: Transaction,
    useRaw: boolean,
  ): Promise<
    RawSendTransactionResponse | SorobanRpc.Api.SendTransactionResponse
  >;
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
    publicKey: string,
    secretKey?: string,
  ): Promise<string>;
  executeTransactionWithRetry(
    transaction: Transaction,
  ): Promise<SorobanRpc.Api.GetSuccessfulTransactionResponse>;
  createDeployContractOperation(
    response: SorobanRpc.Api.GetSuccessfulTransactionResponse,
    sourceKeypair: Keypair | string,
  ): xdr.Operation<Operation.InvokeHostFunction>;
  getAccountOrFund(publicKey: string): Promise<Account>;
  prepareUploadWASM(
    file: Express.Multer.File,
    publicKey: string,
  ): Promise<string>;
  extractContractAddress(
    responseDeploy: SorobanRpc.Api.GetSuccessfulTransactionResponse,
  ): string;
}
