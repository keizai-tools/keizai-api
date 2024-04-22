import { Inject, Injectable, UseInterceptors } from '@nestjs/common';
import { xdr } from '@stellar/stellar-sdk';
import { ResilienceInterceptor, RetryStrategy } from 'nestjs-resilience';

import { StellarAdapter } from '@/common/infrastructure/stellar/stellar.adapter';
import { MethodMapper } from '@/modules/method/application/mapper/method.mapper';
import { Method } from '@/modules/method/domain/method.domain';

import { StellarMapper } from '../mapper/contract.mapper';
import { IContractService } from '../repository/contract.interface.service';
import { ContractErrorResponse, RunInvocationResponse } from '../types/soroban';
import {
  CONTRACT_EXECUTABLE_TYPE,
  GetTransactionStatus,
  NETWORK,
  SOROBAN_CONTRACT_ERROR,
  SendTransactionStatus,
} from '../types/soroban.enum';
import { StellarAssetContractService } from './sac-contract.service';
import { SmartContractService } from './smart-contract.service';

export interface IGeneratedMethod {
  name: string;
  docs: string | null;
  inputs: { name: string; type: string }[];
  outputs: { type: string }[];
}

@Injectable()
export class ContractService implements IContractService {
  private currentNetwork: string;
  constructor(
    @Inject(SmartContractService)
    private readonly smartContractService: SmartContractService,
    @Inject(StellarAssetContractService)
    private readonly stellarAssetContractService: StellarAssetContractService,
    @Inject(StellarAdapter) private readonly stellarAdapter: StellarAdapter,
    @Inject(MethodMapper) private readonly methodMapper: MethodMapper,
    @Inject(StellarMapper) private readonly stellarMapper: StellarMapper,
  ) {
    this.currentNetwork = NETWORK.SOROBAN_FUTURENET;
  }

  verifyNetwork(selectedNetwork: string): void {
    if (selectedNetwork !== this.currentNetwork) {
      this.stellarAdapter.changeNetwork(selectedNetwork);
      this.currentNetwork = selectedNetwork;
    }
  }

  async generateMethodsFromContractId(contractId: string) {
    try {
      const instanceValue = await this.stellarAdapter.getInstanceValue(
        contractId,
      );
      if (
        instanceValue.switch().name === CONTRACT_EXECUTABLE_TYPE.STELLAR_ASSET
      ) {
        return this.stellarAssetContractService.getStellarAssetContractFunctions();
      }

      return this.smartContractService.getSmartContractFunctions(instanceValue);
    } catch (error) {
      throw new Error(error);
    }
  }

  async generateScArgsToFromContractId(
    contractId: string,
    selectedMethod: Partial<Method>,
  ): Promise<xdr.ScVal[]> {
    const instanceValue = await this.stellarAdapter.getInstanceValue(
      contractId,
    );

    if (
      instanceValue.switch().name === CONTRACT_EXECUTABLE_TYPE.STELLAR_ASSET
    ) {
      return this.stellarAssetContractService.getScValFromStellarAssetContract(
        selectedMethod,
      );
    }

    return await this.smartContractService.getScValFromSmartContract(
      instanceValue,
      selectedMethod,
    );
  }

  @UseInterceptors(
    ResilienceInterceptor(
      new RetryStrategy({
        maxRetries: 5,
      }),
    ),
  )
  async runInvocation(
    publicKey: string,
    secretKey: string,
    contractId: string,
    selectedMethod: Partial<Method>,
  ): Promise<RunInvocationResponse | ContractErrorResponse> {
    try {
      const scArgs = await this.generateScArgsToFromContractId(
        contractId,
        selectedMethod,
      );

      const transaction = await this.stellarAdapter.prepareTransaction(
        publicKey,
        contractId,
        selectedMethod.name,
        scArgs,
      );
      this.stellarAdapter.signTransaction(transaction, secretKey);

      const response = await this.stellarAdapter.rawSendTransaction(
        transaction,
      );

      const methodMapped = this.methodMapper.fromDtoToEntity(selectedMethod);

      if (response.status === SendTransactionStatus.ERROR) {
        return {
          status: response.status,
          response: this.stellarMapper.fromTxResultToDisplayResponse(
            response.errorResultXdr,
          ),
          method: methodMapped,
        };
      }

      let newresponse = await this.stellarAdapter.getTransaction(response.hash);

      while (newresponse.status === GetTransactionStatus.NOT_FOUND) {
        newresponse = await this.stellarAdapter.getTransaction(response.hash);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (newresponse.status === GetTransactionStatus.SUCCESS) {
        const events = await this.stellarAdapter.getContractEvents(contractId);
        return {
          method: methodMapped,
          response: this.stellarMapper.fromScValToDisplayValue(
            newresponse.returnValue,
          ),
          status: newresponse.status,
          events: this.stellarMapper.encodeEventToDisplayEvent(events),
        };
      }

      const rawResponse = await this.stellarAdapter.rawGetTransaction(
        response.hash,
      );

      return {
        status: rawResponse.status,
        response: this.stellarMapper.fromTxResultToDisplayResponse(
          rawResponse.resultXdr,
        ),
        method: methodMapped,
      };
    } catch (error) {
      if (
        error.includes(SOROBAN_CONTRACT_ERROR.HOST_FAILED) ||
        error.includes(SOROBAN_CONTRACT_ERROR.HOST_ERROR)
      ) {
        return this.stellarMapper.fromContractErrorToDisplayResponse(error);
      }
      return error;
    }
  }
}
