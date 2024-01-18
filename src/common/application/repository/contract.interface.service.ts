import { xdr } from 'stellar-sdk';

import { Method } from '@/modules/method/domain/method.domain';

import { IGeneratedMethod } from '../service/stellar.service';
import { EventResponse } from '../types/contract-events';

export interface IContractService {
  verifyNetwork(selectedNetwork: string): void;
  changeNetwork(selectedNetwork: string): void;
  getInstanceValue(contractId: string): Promise<xdr.ContractDataEntry>;
  getWasmCode(instance: xdr.ScContractInstance): Promise<Buffer>;
  decodeContractSpecBuffer(buffer);
  extractFunctionInfo(decodedSection, SCSpecTypeMap);
  getContractEvents(contractId: string): Promise<EventResponse[]>;
  generateMethodsFromContractId(
    contractId: string,
  ): Promise<IGeneratedMethod[]>;
  runInvocation(
    publicKey: string,
    secretKey: string,
    contractId: string,
    method: Partial<Method>,
  );
}

export const CONTRACT_SERVICE = 'CONTRACT_SERVICE';
