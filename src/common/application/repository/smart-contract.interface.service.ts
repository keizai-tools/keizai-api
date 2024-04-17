import { Method } from '@/modules/method/domain/method.domain';

import { IGeneratedMethod } from '../service/contract.service';
import { ContractExecutable, ScSpecEntry, ScVal } from '../types/soroban';

export interface ISmartContractService {
  decodeContractSpecBuffer(buffer: ArrayBuffer): Promise<ScSpecEntry[]>;
  extractFunctionInfo(decodedSection: ScSpecEntry): IGeneratedMethod;
  getContractSpecEntries(
    instanceValue: ContractExecutable,
  ): Promise<ScSpecEntry[]>;
  getScValFromSmartContract(
    instanceValue: ContractExecutable,
    selectedMethod: Partial<Method>,
  ): Promise<ScVal[]>;
  getSmartContractFunctions(
    instanceValue: ContractExecutable,
  ): Promise<IGeneratedMethod[]>;
}
