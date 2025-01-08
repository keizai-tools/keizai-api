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
  getPreparedTransactionXDR(
    contractId: string,
    publicKey: string,
    selectedMethod: Partial<Method>,
    userId: string,
  ): Promise<string>;
  runInvocation(
    runInvocationParams: IRunInvocationParams,
    userId: string,
  ): Promise<RunInvocationResponse | ContractErrorResponse>;
  deployWasmFile({
    file,
    signedTransactionXDR,
    invocation,
    userId,
  }: {
    file?: Express.Multer.File;
    signedTransactionXDR?: string;
    invocation?: Invocation;
    userId: string;
  }): Promise<string>;
  prepareUploadWASM({
    userId,
    file,
    publicKey,
    signedTransactionXDR,
  }: {
    userId: string;
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
  pollTransactionStatus(
    hash: string,
  ): Promise<
    | rpc.Api.GetSuccessfulTransactionResponse
    | rpc.Api.GetFailedTransactionResponse
  >;
  generateMethodsFromContractId(
    contractId: string,
    userId: string,
  ): Promise<IGeneratedMethod[]>;
  generateScArgsToFromContractId(
    contractId: string,
    selectedMethod: Partial<Method>,
    userId: string,
  ): Promise<xdr.ScVal[]>;
}
