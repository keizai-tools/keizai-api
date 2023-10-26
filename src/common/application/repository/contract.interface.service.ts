import { IGeneratedMethod } from '../service/stellar.service';

export interface IContractService {
  getLedgerKeyWasmId(contractCodeLedgerEntryData: string);
  decodeContractSpecBuffer(buffer);
  extractFunctionInfo(decodedSection, SCSpecTypeMap);
  generateMethodsFromContractId(
    contractId: string,
  ): Promise<IGeneratedMethod[]>;
  runInvocation(publicKey, contractId, secretKey);
}

export const CONTRACT_SERVICE = 'CONTRACT_SERVICE';
