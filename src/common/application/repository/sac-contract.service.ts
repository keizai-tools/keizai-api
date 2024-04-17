import { Method } from '@/modules/method/domain/method.domain';

import { IGeneratedMethod } from '../service/contract.service';
import { Param, ScVal } from '../types/soroban';

export interface IStellarAssetContractService {
  getScValFromStellarAssetContract(selectedMethod: Partial<Method>): ScVal[];
  getParamsFromStellarAssetContract(selectedMethod: Partial<Method>): Param[];
  getStellarAssetContractFunctions(): IGeneratedMethod[];
}
