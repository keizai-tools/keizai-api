import { Method } from '@/modules/method/domain/method.domain';

import { IGeneratedMethod } from '../service/contract.service';
import {
  ContractErrorResponse,
  RunInvocationResponse,
  ScVal,
} from '../types/soroban';

export interface IContractService {
  verifyNetwork(selectedNetwork: string): void;
  generateMethodsFromContractId(
    contractId: string,
  ): Promise<IGeneratedMethod[]>;
  generateScArgsToFromContractId(
    contractId: string,
    selectedMethod: Method,
  ): Promise<ScVal[]>;
  runInvocation(
    publicKey: string,
    secretKey: string,
    contractId: string,
    method: Partial<Method>,
  ): Promise<RunInvocationResponse | ContractErrorResponse>;
}

export const CONTRACT_SERVICE = 'CONTRACT_SERVICE';
