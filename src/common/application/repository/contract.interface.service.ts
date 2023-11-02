import { Method } from '@/modules/method/domain/method.domain';

import { IGeneratedMethod } from '../service/stellar.service';

export interface IContractService {
  getLedgerKeyWasmId(contractCodeLedgerEntryData: string);
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
