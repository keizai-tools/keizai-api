import { Test } from '@nestjs/testing';
import type { rpc } from '@stellar/stellar-sdk';

import { AppModule } from '@/app.module';
import { COGNITO_AUTH } from '@/common/cognito/application/interface/cognito.service.interface';
import {
  CONTRACT_SERVICE,
  IDecodedSection,
  IStellarService,
} from '@/common/stellar_service/application/interface/contract.service.interface';
import {
  CONTRACT_ADAPTER,
  IStellarAdapter,
} from '@/common/stellar_service/application/interface/stellar.adapter.interface';
import {
  CONTRACT_MAPPER,
  IStellarMapper,
} from '@/common/stellar_service/application/interface/stellar.mapper.interface';
import { Method } from '@/modules/method/domain/method.domain';
import {
  contractExecutable,
  getTxFailed,
  identityProviderServiceMock,
  mockedAdapterContract,
  rawSendTxError,
  rawSendTxPending,
} from '@/test/test.module.bootstrapper';

import {
  CONTRACT_EXECUTABLE_TYPE,
  GetTransactionStatus,
  NETWORK,
  SendTransactionStatus,
} from '../../stellar_service/application/domain/soroban.enum';

describe('StellarService', () => {
  let service: IStellarService;
  let stellarAdapter: IStellarAdapter;
  let stellarMapper: IStellarMapper;
  const mockedMethod = new Method('mock', [], [], [], 'mock');

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(COGNITO_AUTH)
      .useValue(identityProviderServiceMock)
      .overrideProvider(CONTRACT_ADAPTER)
      .useValue(mockedAdapterContract)
      .compile();

    service = moduleRef.get<IStellarService>(CONTRACT_SERVICE);
    stellarAdapter = moduleRef.get<IStellarAdapter>(CONTRACT_ADAPTER);
    stellarMapper = moduleRef.get<IStellarMapper>(CONTRACT_MAPPER);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('verifyNetwork', () => {
    it('Should not change the network if selectedNetwork is the same as the current network', () => {
      const changeNetworkSpy = jest.spyOn(stellarAdapter, 'changeNetwork');

      const selectedNetwork = NETWORK.SOROBAN_FUTURENET;
      service.verifyNetwork({
        selectedNetwork,
        userId: 'userId',
      });

      expect(changeNetworkSpy).not.toHaveBeenCalled();
    });

    it('Should change the network if selectedNetwork is different from the current network', () => {
      const changeNetworkSpy = jest.spyOn(stellarAdapter, 'changeNetwork');

      const selectedNetwork = NETWORK.SOROBAN_TESTNET;
      service.verifyNetwork({
        selectedNetwork,
        userId: 'userId',
      });
      expect(changeNetworkSpy).toHaveBeenCalledWith(selectedNetwork, 'userId');
      expect(changeNetworkSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateMethodsFromContractId', () => {
    it('Should return stellar asset contract functions if instance is of type STELLAR_ASSET', async () => {
      jest
        .spyOn(stellarAdapter, 'getInstanceValue')
        .mockResolvedValue(contractExecutable);
      jest.spyOn(contractExecutable, 'switch').mockReturnValue({
        name: CONTRACT_EXECUTABLE_TYPE.STELLAR_ASSET,
        value: 1,
      });
      jest.spyOn(service, 'getStellarAssetContractFunctions').mockReturnValue([
        {
          name: 'mock',
          docs: null,
          inputs: [{ name: 'mock', type: 'mock' }],
          outputs: [{ type: 'mock' }],
        },
      ]);

      const result = await service.generateMethodsFromContractId('contractId');

      expect(stellarAdapter.getInstanceValue).toHaveBeenCalledWith(
        'contractId',
        service['currentNetwork'],
      );
      expect(service.getStellarAssetContractFunctions).toHaveBeenCalled();
      expect(result).toEqual([
        {
          name: 'mock',
          docs: null,
          inputs: [{ name: 'mock', type: 'mock' }],
          outputs: [{ type: 'mock' }],
        },
      ]);
    });

    it('Should return smart contract functions if instance is of type WASM', async () => {
      jest
        .spyOn(stellarAdapter, 'getInstanceValue')
        .mockResolvedValue(contractExecutable);
      jest.spyOn(contractExecutable, 'switch').mockReturnValue({
        name: CONTRACT_EXECUTABLE_TYPE.WASM,
        value: 0,
      });
      jest
        .spyOn(service, 'getContractSpecEntries')
        .mockResolvedValue([{} as IDecodedSection]);
      jest.spyOn(service, 'extractFunctionInfo').mockReturnValue({
        name: 'mock',
        docs: null,
        inputs: [{ name: 'mock', type: 'mock' }],
        outputs: [{ type: 'mock' }],
      });

      const result = await service.generateMethodsFromContractId('contractId');

      expect(stellarAdapter.getInstanceValue).toHaveBeenCalledWith(
        'contractId',
        service['currentNetwork'],
      );
      expect(service.getContractSpecEntries).toHaveBeenCalledWith(
        contractExecutable,
      );
      expect(service.extractFunctionInfo).toHaveBeenCalledWith(
        {} as IDecodedSection,
      );
      expect(result).toEqual([
        {
          name: 'mock',
          docs: null,
          inputs: [{ name: 'mock', type: 'mock' }],
          outputs: [{ type: 'mock' }],
        },
      ]);
    });

    it('Should filter out functions with empty names', async () => {
      jest
        .spyOn(stellarAdapter, 'getInstanceValue')
        .mockResolvedValue(contractExecutable);
      jest.spyOn(contractExecutable, 'switch').mockReturnValue({
        name: CONTRACT_EXECUTABLE_TYPE.WASM,
        value: 0,
      });
      jest
        .spyOn(service, 'getContractSpecEntries')
        .mockResolvedValue([{} as IDecodedSection]);
      jest.spyOn(service, 'extractFunctionInfo').mockReturnValue({
        name: '',
        docs: null,
        inputs: [{ name: 'mock', type: 'mock' }],
        outputs: [{ type: 'mock' }],
      });

      const result = await service.generateMethodsFromContractId('contractId');

      expect(stellarAdapter.getInstanceValue).toHaveBeenCalledWith(
        'contractId',
        service['currentNetwork'],
      );
      expect(service.getContractSpecEntries).toHaveBeenCalledWith(
        contractExecutable,
      );
      expect(service.extractFunctionInfo).toHaveBeenCalledWith(
        {} as IDecodedSection,
      );
      expect(result).toEqual([]);
    });
  });

  describe('generateMethodsFromContractId', () => {
    it('Should return stellar asset contract functions if instance is of type STELLAR_ASSET', async () => {
      jest
        .spyOn(stellarAdapter, 'getInstanceValue')
        .mockResolvedValue(contractExecutable);
      jest.spyOn(contractExecutable, 'switch').mockReturnValue({
        name: CONTRACT_EXECUTABLE_TYPE.STELLAR_ASSET,
        value: 1,
      });
      jest.spyOn(service, 'getStellarAssetContractFunctions').mockReturnValue([
        {
          name: 'mock',
          docs: null,
          inputs: [{ name: 'mock', type: 'mock' }],
          outputs: [{ type: 'mock' }],
        },
      ]);

      const result = await service.generateMethodsFromContractId('contractId');

      expect(stellarAdapter.getInstanceValue).toHaveBeenCalledWith(
        'contractId',
        service['currentNetwork'],
      );
      expect(service.getStellarAssetContractFunctions).toHaveBeenCalled();
      expect(result).toEqual([
        {
          name: 'mock',
          docs: null,
          inputs: [{ name: 'mock', type: 'mock' }],
          outputs: [{ type: 'mock' }],
        },
      ]);
    });

    it('Should return smart contract functions if instance is of type WASM', async () => {
      jest
        .spyOn(stellarAdapter, 'getInstanceValue')
        .mockResolvedValue(contractExecutable);
      jest.spyOn(contractExecutable, 'switch').mockReturnValue({
        name: CONTRACT_EXECUTABLE_TYPE.WASM,
        value: 0,
      });
      jest
        .spyOn(service, 'getContractSpecEntries')
        .mockResolvedValue([{} as IDecodedSection]);
      jest.spyOn(service, 'extractFunctionInfo').mockReturnValue({
        name: 'mock',
        docs: null,
        inputs: [{ name: 'mock', type: 'mock' }],
        outputs: [{ type: 'mock' }],
      });

      const result = await service.generateMethodsFromContractId('contractId');

      expect(stellarAdapter.getInstanceValue).toHaveBeenCalledWith(
        'contractId',
        service['currentNetwork'],
      );
      expect(service.getContractSpecEntries).toHaveBeenCalledWith(
        contractExecutable,
      );
      expect(service.extractFunctionInfo).toHaveBeenCalledWith(
        {} as IDecodedSection,
      );
      expect(result).toEqual([
        {
          name: 'mock',
          docs: null,
          inputs: [{ name: 'mock', type: 'mock' }],
          outputs: [{ type: 'mock' }],
        },
      ]);
    });

    it('Should filter out functions with empty names', async () => {
      jest
        .spyOn(stellarAdapter, 'getInstanceValue')
        .mockResolvedValue(contractExecutable);
      jest.spyOn(contractExecutable, 'switch').mockReturnValue({
        name: CONTRACT_EXECUTABLE_TYPE.WASM,
        value: 0,
      });
      jest
        .spyOn(service, 'getContractSpecEntries')
        .mockResolvedValue([{} as IDecodedSection]);
      jest.spyOn(service, 'extractFunctionInfo').mockReturnValue({
        name: '',
        docs: null,
        inputs: [{ name: 'mock', type: 'mock' }],
        outputs: [{ type: 'mock' }],
      });

      const result = await service.generateMethodsFromContractId('contractId');

      expect(stellarAdapter.getInstanceValue).toHaveBeenCalledWith(
        'contractId',
        service['currentNetwork'],
      );
      expect(service.getContractSpecEntries).toHaveBeenCalledWith(
        contractExecutable,
      );
      expect(service.extractFunctionInfo).toHaveBeenCalledWith(
        {} as IDecodedSection,
      );
      expect(result).toEqual([]);
    });
  });

  describe('runInvocation', () => {
    const setupCommonMocks = () => {
      jest
        .spyOn(service, 'generateScArgsToFromContractId')
        .mockResolvedValue([]);
      jest
        .spyOn(stellarAdapter, 'prepareTransaction')
        .mockImplementation(jest.fn());
      jest.spyOn(stellarAdapter, 'signTransaction').mockReturnValue();
    };

    jest.retryTimes(5);

    it('Should return a transaction with status error', async () => {
      jest
        .spyOn(stellarAdapter, 'sendTransaction')
        .mockResolvedValue(rawSendTxError);

      jest
        .spyOn(stellarMapper, 'fromTxResultToDisplayResponse')
        .mockReturnValue('txError');

      setupCommonMocks();

      const result = await service.runInvocation(
        {
          contractId: 'contractId',
          selectedMethod: mockedMethod,
          publicKey: 'publicKey',
          secretKey: 'secretKey',
        },
        'userId',
      );

      expect(stellarAdapter.sendTransaction).toHaveBeenCalled();
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
        .spyOn(stellarAdapter, 'sendTransaction')
        .mockResolvedValue(
          rawSendTxPending as rpc.Api.RawSendTransactionResponse,
        );
      jest
        .spyOn(stellarMapper, 'fromTxResultToDisplayResponse')
        .mockReturnValue('txFailed');
      jest
        .spyOn(stellarAdapter, 'getTransaction')
        .mockResolvedValue(getTxFailed);
      jest
        .spyOn(stellarAdapter, 'getTransaction')
        .mockResolvedValue(getTxFailed);

      const result = await service.runInvocation(
        {
          contractId: 'contractId',
          selectedMethod: new Method(
            'increment',
            [],
            [{ type: 'SC_SPEC_TYPE_U32' }],
            [],
            '',
            '41e62067',
          ),
          publicKey: 'publicKey',
          secretKey: 'secretKey',
        },
        'userId',
      );

      expect(stellarAdapter.sendTransaction).toHaveBeenCalled();
      expect(stellarAdapter.getTransaction).toHaveBeenCalled();
      expect(stellarAdapter.getTransaction).toHaveBeenCalled();
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
        .spyOn(stellarAdapter, 'sendTransaction')
        .mockRejectedValue(
          'Caused by:\n    HostError: Error(Contract, #2)\n    \n',
        );

      const result = await service.runInvocation(
        {
          contractId: 'contractId',
          selectedMethod: new Method(
            'increment',
            [],
            [{ type: 'SC_SPEC_TYPE_U32' }],
            [],
            '',
            '41e62067',
          ),
          publicKey: 'publicKey',
          secretKey: 'secretKey',
        },
        'userId',
      );

      expect(stellarAdapter.sendTransaction).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          status: SendTransactionStatus.ERROR,
          title: 'host invocation failed',
        }),
      );
    });
  });
});
