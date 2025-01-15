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
  currentNetwork: NETWORK;
  verifyNetwork({
    selectedNetwork,
    contractId,
    userId,
  }: {
    selectedNetwork: NETWORK;
    contractId?: string;
    userId: string;
  }): Promise<NETWORK>;
  extractContractAddress({
    responseDeploy,
  }: {
    responseDeploy: rpc.Api.GetSuccessfulTransactionResponse;
  }): string;
  executeTransactionWithRetry({
    transaction,
  }: {
    transaction: Transaction;
  }): Promise<rpc.Api.GetSuccessfulTransactionResponse>;
  changeNetwork({
    selectedNetwork,
    userId,
  }: {
    selectedNetwork: NETWORK;
    userId: string;
  }): Promise<void>;

  getScSpecEntryFromXDR({ input }: { input: Uint8Array }): xdr.ScSpecEntry;

  createContractSpec({
    entries,
  }: {
    entries: xdr.ScSpecEntry[];
  }): Promise<contract.Spec>;

  contractExists({
    contractId,
    currentNetwork,
    userId,
  }: {
    contractId: string;
    currentNetwork: NETWORK;
    userId: string;
  }): Promise<rpc.Api.GetLedgerEntriesResponse>;

  getInstanceValue({
    contractId,
    currentNetwork,
    userId,
  }: {
    contractId: string;
    currentNetwork: NETWORK;
    userId: string;
  }): Promise<xdr.ContractExecutable>;

  getWasmCode({
    instance,
    currentNetwork,
    userId,
  }: {
    instance: xdr.ContractExecutable;
    currentNetwork: NETWORK;
    userId: string;
  }): Promise<Buffer>;

  getContractEvents({
    contractId,
    currentNetwork,
    userId,
  }: {
    contractId: string;
    currentNetwork: NETWORK;
    userId: string;
  }): Promise<EncodeEvent[]>;

  getKeypair({ secretKey }: { secretKey: string }): Keypair;

  sendTransaction({
    transaction,
    currentNetwork,
    userId,
    useRaw,
  }: {
    transaction: Transaction;
    currentNetwork: NETWORK;
    userId: string;
    useRaw?: boolean;
  }): Promise<RawSendTransactionResponse | rpc.Api.SendTransactionResponse>;

  getTransaction({
    hash,
    currentNetwork,
    userId,
    useRaw,
  }: {
    hash: string;
    currentNetwork: NETWORK;
    userId: string;
    useRaw?: boolean;
  }): Promise<RawGetTransactionResponse | GetTransactionResponse>;

  uploadWasm({
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
  }): Promise<string>;

  deployContract({
    response,
    currentNetwork,
    sourceKeypair,
    userId,
  }: {
    response: rpc.Api.GetSuccessfulTransactionResponse;
    currentNetwork: NETWORK;
    sourceKeypair: Keypair;
    userId: string;
  }): Promise<string>;

  submitSignedTransaction({
    signedXdr,
    currentNetwork,
    userId,
  }: {
    signedXdr: string;
    currentNetwork: NETWORK;
    userId: string;
  }): Promise<rpc.Api.SendTransactionResponse>;

  prepareUploadWASM({
    file,
    currentNetwork,
    publicKey,
    userId,
  }: {
    file: Express.Multer.File;
    currentNetwork: NETWORK;
    publicKey: string;
    userId: string;
  }): Promise<string>;

  signTransaction({
    transaction,
    sourceKeypair,
  }: {
    transaction: Transaction;
    sourceKeypair: Keypair;
  }): void;

  prepareTransaction({
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
  }): Promise<Transaction>;

  streamTransactionsByMemoId({
    publicKey,
    currentNetwork,
    userId,
    memoId,
  }: {
    publicKey: string;
    currentNetwork?: NETWORK;
    userId?: string;
    memoId?: string;
  }): Promise<void>;

  getAccountOrFund({
    publicKey,
    currentNetwork,
    userId,
  }: {
    publicKey: string;
    currentNetwork: NETWORK;
    userId: string;
  }): Promise<Account>;

  checkContractNetwork({
    contractId,
    currentNetwork,
    userId,
  }: {
    contractId: string;
    currentNetwork: NETWORK;
    userId: string;
  }): Promise<NETWORK>;
}
