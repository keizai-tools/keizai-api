import { xdr } from '@stellar/stellar-sdk';

import { Method } from '@/modules/method/domain/method.domain';

import { IGeneratedMethod } from '../service/stellar.service';
import { ContractErrorResponse, RunInvocationResponse } from '../types/soroban';

export interface IContractService {
  verifyNetwork(selectedNetwork: string): void;
  getStellarAssetContractFunctions(): IGeneratedMethod[];
  decodeContractSpecBuffer(buffer: ArrayBuffer): Promise<xdr.ScSpecEntry[]>;
  extractFunctionInfo(decodedSection: xdr.ScSpecEntry): IGeneratedMethod;
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

export const CONTRACT_SERVICE = 'CONTRACT_SERVICE';
