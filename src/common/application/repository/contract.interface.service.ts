import { xdr } from 'soroban-client';

import { Method } from '@/modules/method/domain/method.domain';

import { IGeneratedMethod } from '../service/stellar.service';

export interface IContractService {
  getInstanceValue(contractId: string): Promise<xdr.ContractDataEntry>;
  getWasmCode(instance: xdr.ScContractInstance): Promise<Buffer>;
  decodeContractSpecBuffer(buffer);
  extractFunctionInfo(decodedSection, SCSpecTypeMap);
  generateMethodsFromContractId(
    contractId: string,
  ): Promise<IGeneratedMethod[]>;
  runInvocation(
    publicKey: string,
    secretKey: string,
    contractId: string,
    method: Method,
  );
}

export const CONTRACT_SERVICE = 'CONTRACT_SERVICE';
