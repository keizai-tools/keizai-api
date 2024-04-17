/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';

import { StellarAdapter } from '@/common/infrastructure/stellar/stellar.adapter';
import { MethodMapper } from '@/modules/method/application/mapper/method.mapper';
import { Method } from '@/modules/method/domain/method.domain';

import { StellarMapper } from '../../mapper/contract.mapper';
import {
  CONTRACT_EXECUTABLE_TYPE,
  GetTransactionStatus,
  NETWORK,
  SendTransactionStatus,
} from '../../types/soroban.enum';
import { ContractService } from '../contract.service';
import { StellarAssetContractService } from '../sac-contract.service';
import { SmartContractService } from '../smart-contract.service';
import {
  contractExecutable,
  getTxFailed,
  rawGetTxFailed,
  rawSendTxError,
  rawSendTxPending,
} from './stellar.service.mocks';

describe('StellarService', () => {
  let service: ContractService;
  let stellarAdapter: StellarAdapter;
  let methodMapper: MethodMapper;
  let stellarMapper: StellarMapper;
  let smartContractService: SmartContractService;
  let stellarAssetContractService: StellarAssetContractService;
  const mockedMethod = new Method('mock', [], [], [], 'mock');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractService,
        StellarAdapter,
        MethodMapper,
        StellarMapper,
        SmartContractService,
        StellarAssetContractService,
      ],
    }).compile();

    service = module.get<ContractService>(ContractService);
    stellarAdapter = module.get<StellarAdapter>(StellarAdapter);
    methodMapper = module.get<MethodMapper>(MethodMapper);
    stellarMapper = module.get<StellarMapper>(StellarMapper);
    smartContractService =
      module.get<SmartContractService>(SmartContractService);
    stellarAssetContractService = module.get<StellarAssetContractService>(
      StellarAssetContractService,
    );
  });

  describe('verifyNetwork', () => {
    it('Should not change the network if selectedNetwork is the same as the current network', () => {
      const changeNetworkSpy = jest.spyOn(stellarAdapter, 'changeNetwork');

      const selectedNetwork = NETWORK.SOROBAN_FUTURENET;
      service.verifyNetwork(selectedNetwork);

      expect(changeNetworkSpy).not.toHaveBeenCalled();
    });

    it('Should change the network if selectedNetwork is different from the current network', () => {
      const changeNetworkSpy = jest.spyOn(stellarAdapter, 'changeNetwork');

      const selectedNetwork = NETWORK.SOROBAN_TESTNET;
      service.verifyNetwork(selectedNetwork);

      expect(changeNetworkSpy).toHaveBeenCalledWith(selectedNetwork);
      expect(changeNetworkSpy).toHaveBeenCalledTimes(1);
    });
  });
  describe('generateMethodsFromContractId', () => {
    it('Should return the stellar asset contract functions', async () => {
      jest
        .spyOn(stellarAdapter, 'getInstanceValue')
        .mockResolvedValue(contractExecutable);
      jest.spyOn(contractExecutable, 'switch').mockReturnValue({
        name: CONTRACT_EXECUTABLE_TYPE.STELLAR_ASSET,
        value: 1,
      });
      jest
        .spyOn(stellarAssetContractService, 'getStellarAssetContractFunctions')
        .mockReturnValue([]);

      const result = await service.generateMethodsFromContractId('contractId');

      expect(stellarAdapter.getInstanceValue).toHaveBeenCalled();
      expect(
        stellarAssetContractService.getStellarAssetContractFunctions,
      ).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
    it('Should return the smart contract functions', async () => {
      jest
        .spyOn(stellarAdapter, 'getInstanceValue')
        .mockResolvedValue(contractExecutable);
      jest.spyOn(contractExecutable, 'switch').mockReturnValue({
        name: CONTRACT_EXECUTABLE_TYPE.WASM,
        value: 0,
      });
      jest.spyOn(
        stellarAssetContractService,
        'getStellarAssetContractFunctions',
      );
      jest
        .spyOn(smartContractService, 'getSmartContractFunctions')
        .mockResolvedValue([]);

      const result = await service.generateMethodsFromContractId('contractId');

      expect(stellarAdapter.getInstanceValue).toHaveBeenCalled();
      expect(
        stellarAssetContractService.getStellarAssetContractFunctions,
      ).not.toHaveBeenCalled();
      expect(smartContractService.getSmartContractFunctions).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
  describe('generateScArgsToFromContractId', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('Should return the stellar asset contract arguments', async () => {
      jest
        .spyOn(stellarAdapter, 'getInstanceValue')
        .mockResolvedValue(contractExecutable);
      jest.spyOn(contractExecutable, 'switch').mockReturnValue({
        name: CONTRACT_EXECUTABLE_TYPE.STELLAR_ASSET,
        value: 1,
      });
      jest
        .spyOn(stellarAssetContractService, 'getScValFromStellarAssetContract')
        .mockReturnValue([]);
      jest.spyOn(smartContractService, 'getScValFromSmartContract');

      const result = await service.generateScArgsToFromContractId(
        'contractId',
        mockedMethod,
      );

      expect(stellarAdapter.getInstanceValue).toHaveBeenCalled();
      expect(
        stellarAssetContractService.getScValFromStellarAssetContract,
      ).toHaveBeenCalled();
      expect(
        smartContractService.getScValFromSmartContract,
      ).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
    it('Should return the smart contract arguments', async () => {
      jest
        .spyOn(stellarAdapter, 'getInstanceValue')
        .mockResolvedValue(contractExecutable);
      jest.spyOn(contractExecutable, 'switch').mockReturnValue({
        name: CONTRACT_EXECUTABLE_TYPE.WASM,
        value: 0,
      });
      jest.spyOn(
        stellarAssetContractService,
        'getScValFromStellarAssetContract',
      );
      jest
        .spyOn(smartContractService, 'getScValFromSmartContract')
        .mockResolvedValue([]);

      const result = await service.generateScArgsToFromContractId(
        'contractId',
        mockedMethod,
      );

      expect(stellarAdapter.getInstanceValue).toHaveBeenCalled();
      expect(
        stellarAssetContractService.getScValFromStellarAssetContract,
      ).not.toHaveBeenCalled();
      expect(smartContractService.getScValFromSmartContract).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
  describe('RunInvocation', () => {
    const setupCommonMocks = () => {
      jest
        .spyOn(service, 'generateScArgsToFromContractId')
        .mockResolvedValue([]);
      jest
        .spyOn(stellarAdapter, 'prepareTransaction')
        .mockImplementation(jest.fn());
      jest.spyOn(stellarAdapter, 'signTransaction').mockReturnValue();
    };

    it('Should return a transaction with status error', async () => {
      setupCommonMocks();
      jest
        .spyOn(stellarMapper, 'fromTxResultToDisplayResponse')
        .mockReturnValue('txError');
      jest
        .spyOn(stellarAdapter, 'rawSendTransaction')
        .mockResolvedValue(rawSendTxError);

      const result = await service.runInvocation(
        'publicKey',
        'secretKey',
        'contractId',
        mockedMethod,
      );

      expect(stellarAdapter.rawSendTransaction).toHaveBeenCalled();
      expect(stellarMapper.fromTxResultToDisplayResponse).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          status: SendTransactionStatus.ERROR,
          response: 'txError',
        }),
      );
    });

    it('Should return a failed transaction', async () => {
      setupCommonMocks();
      jest
        .spyOn(stellarAdapter, 'rawSendTransaction')
        .mockResolvedValue(rawSendTxPending);
      jest
        .spyOn(stellarMapper, 'fromTxResultToDisplayResponse')
        .mockReturnValue('txFailed');
      jest
        .spyOn(stellarAdapter, 'getTransaction')
        .mockResolvedValue(getTxFailed);
      jest
        .spyOn(stellarAdapter, 'rawGetTransaction')
        .mockResolvedValue(rawGetTxFailed);

      const result = await service.runInvocation(
        'publicKey',
        'secretKey',
        'contractId',
        mockedMethod,
      );

      expect(stellarAdapter.rawSendTransaction).toHaveBeenCalled();
      expect(stellarAdapter.getTransaction).toHaveBeenCalled();
      expect(stellarAdapter.rawGetTransaction).toHaveBeenCalled();
      expect(stellarMapper.fromTxResultToDisplayResponse).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          status: GetTransactionStatus.FAILED,
          response: 'txFailed',
        }),
      );
    });

    it('Should throw an error when try to run invocation', async () => {
      setupCommonMocks();
      jest
        .spyOn(stellarAdapter, 'rawSendTransaction')
        .mockRejectedValue(
          'Caused by:\n    HostError: Error(Contract, #2)\n    \n',
        );

      const result = await service.runInvocation(
        'publicKey',
        'secretKey',
        'contractId',
        mockedMethod,
      );

      expect(stellarAdapter.rawSendTransaction).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          status: SendTransactionStatus.ERROR,
          title: 'host invocation failed',
        }),
      );
    });
  });
});
