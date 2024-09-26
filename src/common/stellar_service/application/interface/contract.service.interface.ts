import { type SorobanRpc, xdr } from '@stellar/stellar-sdk';

import type { Invocation } from '@/modules/invocation/domain/invocation.domain';
import { Method } from '@/modules/method/domain/method.domain';

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
  verifyNetwork(selectedNetwork: string, contractId?: string): Promise<string>;
  getPreparedTransactionXDR(
    contractId: string,
    publicKey: string,
    selectedMethod: Partial<Method>,
  ): Promise<string>;
  runInvocation(
    runInvocationParams: IRunInvocationParams,
  ): Promise<RunInvocationResponse | ContractErrorResponse>;
  generateMethodsFromContractId(
    contractId: string,
  ): Promise<IGeneratedMethod[]>;
  deployWasmFile({
    file,
    signedTransactionXDR,
    invocation,
  }: {
    file?: Express.Multer.File;
    signedTransactionXDR?: string;
    invocation?: Invocation;
  }): Promise<string>;
  prepareUploadWASM({
    file,
    publicKey,
    signedTransactionXDR,
  }: {
    file?: Express.Multer.File;
    publicKey?: string;
    signedTransactionXDR?: string;
  }): Promise<string>;
  runUploadWASM(signedTransactionXDR: string): Promise<string>;
  getScValFromSmartContract(
    instanceValue: xdr.ContractExecutable,
    selectedMethod: Partial<Method>,
  ): Promise<xdr.ScVal[]>;
  getContractSpecEntries(
    instanceValue: xdr.ContractExecutable,
  ): Promise<xdr.ScSpecEntry[]>;
  getStellarAssetContractFunctions(): IGeneratedMethod[];
  extractFunctionInfo(decodedSection: IDecodedSection): IGeneratedMethod;
  generateScArgsToFromContractId(
    contractId: string,
    selectedMethod: Partial<Method>,
  ): Promise<xdr.ScVal[]>;
  pollTransactionStatus(
    hash: string,
  ): Promise<
    | SorobanRpc.Api.GetSuccessfulTransactionResponse
    | SorobanRpc.Api.GetFailedTransactionResponse
  >;
}
