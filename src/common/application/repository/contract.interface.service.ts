import { xdr } from 'stellar-sdk';

import { Method } from '@/modules/method/domain/method.domain';

import { IGeneratedMethod } from '../service/stellar.service';
import { EncodeEvent } from '../types/contract-events';

export interface IContractService {
  verifyNetwork(selectedNetwork: string): void;
  changeNetwork(selectedNetwork: string): void;
  getStellarAssetContractFunctions(): IGeneratedMethod[];
  getInstanceValue(contractId: string): Promise<xdr.ContractExecutable>;
  getWasmCode(instance: xdr.ContractExecutable): Promise<Buffer>;
  decodeContractSpecBuffer(buffer);
  extractFunctionInfo(decodedSection, SCSpecTypeMap);
  getContractEvents(contractId: string): Promise<EncodeEvent[]>;
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
  );
}

export const CONTRACT_SERVICE = 'CONTRACT_SERVICE';
