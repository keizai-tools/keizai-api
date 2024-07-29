import { xdr } from '@stellar/stellar-sdk';

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

export interface IStellarService {
  verifyNetwork(selectedNetwork: string): void;
  getStellarAssetContractFunctions(): IGeneratedMethod[];
  decodeContractSpecBuffer(buffer: ArrayBuffer): Promise<xdr.ScSpecEntry[]>;
  extractFunctionInfo(decodedSection: IDecodedSection): IGeneratedMethod;
  getContractSpecEntries(
    instanceValue: xdr.ContractExecutable,
  ): Promise<xdr.ScSpecEntry[]>;
  getScValFromSmartContract(
    instanceValue: xdr.ContractExecutable,
    selectedMethod: Partial<Method>,
  ): Promise<xdr.ScVal[]>;
  generateMethodsFromContractId(
    contractId: string,
  ): Promise<IGeneratedMethod[]>;
  generateScArgsToFromContractId(
    contractId: string,
    selectedMethod: Method,
  ): Promise<xdr.ScVal[]>;
  runInvocation(
    publicKey: string,
    secretKey: string,
    contractId: string,
    method: Partial<Method>,
  ): Promise<RunInvocationResponse | ContractErrorResponse>;
}
