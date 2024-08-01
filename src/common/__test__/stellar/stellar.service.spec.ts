import { Test } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { COGNITO_AUTH } from '@/common/cognito/application/interface/cognito.service.interface';
import {
  CONTRACT_SERVICE,
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
  contracts,
  getTxFailed,
  identityProviderServiceMock,
  rawGetTxFailed,
  rawSendTxError,
  rawSendTxPending,
  selectedMethod,
} from '@/test/test.module.bootstrapper';
import { getRandomKeypair } from '@/test/test.util';

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
      .compile();

    service = moduleRef.get<IStellarService>(CONTRACT_SERVICE);
    stellarAdapter = moduleRef.get<IStellarAdapter>(CONTRACT_ADAPTER);
    stellarMapper = moduleRef.get<IStellarMapper>(CONTRACT_MAPPER);
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
    it('Should return the smart contract functions', async () => {
      stellarAdapter.changeNetwork(NETWORK.SOROBAN_TESTNET);

      const result = await service.generateMethodsFromContractId(
        contracts.smart,
      );

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'increment' }),
        ]),
      );
    }, 50000);
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
        .spyOn(stellarMapper, 'getScValFromStellarAssetContract')
        .mockReturnValue([]);
      jest.spyOn(service, 'getScValFromSmartContract');

      const result = await service.generateScArgsToFromContractId(
        'contractId',
        mockedMethod,
      );

      expect(stellarAdapter.getInstanceValue).toHaveBeenCalled();
      expect(stellarMapper.getScValFromStellarAssetContract).toHaveBeenCalled();
      expect(service.getScValFromSmartContract).not.toHaveBeenCalled();
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
      jest.spyOn(stellarMapper, 'getScValFromStellarAssetContract');
      jest.spyOn(service, 'getContractSpecEntries').mockResolvedValue([]);
      jest.spyOn(service, 'getScValFromSmartContract').mockResolvedValue([]);

      const result = await service.generateScArgsToFromContractId(
        'contractId',
        mockedMethod,
      );

      expect(stellarAdapter.getInstanceValue).toHaveBeenCalled();
      expect(
        stellarMapper.getScValFromStellarAssetContract,
      ).not.toHaveBeenCalled();
      expect(service.getScValFromSmartContract).toHaveBeenCalled();
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

    jest.retryTimes(5);

    it('Should return a successfully transaction with a smart contract', async () => {
      stellarAdapter.changeNetwork(NETWORK.SOROBAN_TESTNET);

      const { publicKey, secretKey } = await getRandomKeypair();
      const result = await service.runInvocation(
        publicKey,
        secretKey,
        contracts.smart,
        selectedMethod.smart,
      );

      expect(result.status).toEqual(GetTransactionStatus.SUCCESS);
    }, 50000);

    jest.retryTimes(5);

    it('Should return a successfully transaction with a stellar asset contract', async () => {
      stellarAdapter.changeNetwork(NETWORK.SOROBAN_TESTNET);

      const { publicKey, secretKey } = await getRandomKeypair();
      const result = await service.runInvocation(
        publicKey,
        secretKey,
        contracts.sac,
        selectedMethod.sac,
      );

      expect(result).toEqual(
        expect.objectContaining({
          status: GetTransactionStatus.SUCCESS,
          response: 'USDC',
        }),
      );
    }, 50000);

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
