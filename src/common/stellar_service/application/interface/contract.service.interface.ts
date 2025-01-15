import { type rpc, xdr } from '@stellar/stellar-sdk';

import type { Invocation } from '@/modules/invocation/domain/invocation.domain';
import { Method } from '@/modules/method/domain/method.domain';

import type { NETWORK } from '../domain/soroban.enum';
import { ContractErrorResponse, RunInvocationResponse } from './soroban';

export const CONTRACT_SERVICE = 'CONTRACT_SERVICE';

export interface IGeneratedMethod {
  name: string;
  docs: string | null;
  inputs: { name: string; type: string }[];
  outputs: { type: string }[];
}

export interface IDecodedSection extends xdr.ScSpecEntry {
  _switch: { name: string };
  _value: {
    _attributes: {
      name: Buffer;
      doc: Buffer;
      inputs: {
        _attributes: { name: Buffer; type: { _switch: { value: number } } };
      }[];
      outputs: { _switch: { value: number } }[];
    };
  };
}

export interface IRunInvocationParams {
  contractId: string;
  selectedMethod: Partial<Method>;
  signedTransactionXDR?: string;
  publicKey?: string;
  secretKey?: string;
}

export interface IStellarService {
  verifyNetwork({
    selectedNetwork,
    contractId,
    userId,
  }: {
    selectedNetwork: NETWORK;
    contractId?: string;
    userId: string;
  }): Promise<NETWORK>;
  getNetworkPassphrase(): string;
  generateMethodsFromContractId({
    contractId,
    userId,
    currentNetwork,
  }: {
    contractId: string;
    userId: string;
    currentNetwork: NETWORK;
  }): Promise<IGeneratedMethod[]>;

  runInvocation({
    runInvocationParams,
    userId,
    currentNetwork,
  }: {
    runInvocationParams: IRunInvocationParams;
    userId: string;
    currentNetwork: NETWORK;
  }): Promise<RunInvocationResponse | ContractErrorResponse>;

  getPreparedTransactionXDR({
    contractId,
    publicKey,
    selectedMethod,
    userId,
    currentNetwork,
  }: {
    contractId: string;
    publicKey: string;
    selectedMethod: Partial<Method>;
    userId: string;
    currentNetwork: NETWORK;
  }): Promise<string>;

  pollTransactionStatus({
    hash,
    userId,
    currentNetwork,
  }: {
    hash: string;
    userId: string;
    currentNetwork: NETWORK;
  }): Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.GetFailedTransactionResponse
  >;

  generateScArgsToFromContractId({
    contractId,
    selectedMethod,
    userId,
    currentNetwork,
  }: {
    contractId: string;
    selectedMethod: Partial<Method>;
    userId: string;
    currentNetwork: NETWORK;
  }): Promise<xdr.ScVal[]>;

  getStellarAssetContractFunctions(): IGeneratedMethod[];

  extractFunctionInfo({
    decodedSection,
  }: {
    decodedSection: IDecodedSection;
  }): IGeneratedMethod;

  getContractSpecEntries({
    instanceValue,
    userId,
    currentNetwork,
  }: {
    instanceValue: xdr.ContractExecutable;
    userId: string;
    currentNetwork: NETWORK;
  }): Promise<xdr.ScSpecEntry[]>;

  getScValFromSmartContract({
    instanceValue,
    selectedMethod,
    userId,
    currentNetwork,
  }: {
    instanceValue: xdr.ContractExecutable;
    selectedMethod: Partial<Method>;
    userId: string;
    currentNetwork: NETWORK;
  }): Promise<xdr.ScVal[]>;

  deployWasmFile({
    file,
    invocation,
    userId,
    currentNetwork,
  }: {
    currentNetwork: NETWORK;
    file?: Express.Multer.File;
    invocation?: Invocation;
    userId: string;
  }): Promise<string>;

  prepareUploadWASM({
    userId,
    file,
    publicKey,
    signedTransactionXDR,
    currentNetwork,
  }: {
    userId: string;
    file?: Express.Multer.File;
    publicKey?: string;
    signedTransactionXDR?: string;
    currentNetwork: NETWORK;
  }): Promise<string>;

  runUploadWASM({
    signedTransactionXDR,
  }: {
    signedTransactionXDR: string;
  }): Promise<string>;
}
