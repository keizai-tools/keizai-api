import { Test } from '@nestjs/testing';
import {
  Memo,
  MemoType,
  Operation,
  Transaction,
  TransactionBuilder,
  rpc,
  xdr,
} from '@stellar/stellar-sdk';

import { AppModule } from '@/app.module';
import { COGNITO_AUTH } from '@/common/cognito/application/interface/cognito.service.interface';
import {
  GetTransactionStatus,
  NETWORK,
  SendTransactionStatus,
} from '@/common/stellar_service/application/domain/soroban.enum';
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
  getTxFailed,
  identityProviderServiceMock,
  mockedAdapterContract,
  rawSendTxError,
  rawSendTxPending,
} from '@/test/test.module.bootstrapper';

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
    it('should verify the network successfully', async () => {
      const selectedNetwork = NETWORK.SOROBAN_TESTNET;
      const contractId = 'testContractId';
      const userId = 'testUserId';

      jest
        .spyOn(stellarAdapter, 'verifyNetwork')
        .mockResolvedValue(selectedNetwork);

      const result = await service.verifyNetwork({
        selectedNetwork,
        contractId,
        userId,
      });

      expect(result).toBe(selectedNetwork);
      expect(stellarAdapter.verifyNetwork).toHaveBeenCalledWith({
        selectedNetwork,
        contractId,
        userId,
      });
    });

    it('should throw an error if network verification fails', async () => {
      const selectedNetwork = NETWORK.SOROBAN_TESTNET;
      const contractId = 'testContractId';
      const userId = 'testUserId';

      jest
        .spyOn(stellarAdapter, 'verifyNetwork')
        .mockRejectedValue(new Error('Network verification failed'));

      await expect(
        service.verifyNetwork({ selectedNetwork, contractId, userId }),
      ).rejects.toThrow('Network verification failed');
      expect(stellarAdapter.verifyNetwork).toHaveBeenCalledWith({
        selectedNetwork,
        contractId,
        userId,
      });
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

      const result = await service.runInvocation({
        runInvocationParams: {
          contractId: 'contractId',
          selectedMethod: mockedMethod,
          publicKey: 'publicKey',
          secretKey: 'secretKey',
        },
        currentNetwork: NETWORK.SOROBAN_TESTNET,
        userId: 'userId',
      });

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

      const result = await service.runInvocation({
        runInvocationParams: {
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
        currentNetwork: NETWORK.SOROBAN_TESTNET,
        userId: 'userId',
      });

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

      const result = await service.runInvocation({
        currentNetwork: NETWORK.SOROBAN_TESTNET,
        userId: 'userId',
        runInvocationParams: {
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
      });

      expect(stellarAdapter.sendTransaction).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          status: SendTransactionStatus.ERROR,
          title: 'host invocation failed',
        }),
      );
    });

    describe('runUploadWASM', () => {
      const signedTransactionXDR = 'signedTransactionXDR';
      const mockTransaction = {} as Transaction<Memo<MemoType>, Operation[]>;
      const mockDeployResponse: rpc.Api.GetSuccessfulTransactionResponse = {
        status: GetTransactionStatus.SUCCESS,
        ledger: 0,
        createdAt: 0,
        applicationOrder: 0,
        feeBump: false,
        envelopeXdr: {} as xdr.TransactionEnvelope,
        resultXdr: {} as xdr.TransactionResult,
        resultMetaXdr: {} as xdr.TransactionMeta,
        txHash: '',
        latestLedger: 0,
        latestLedgerCloseTime: 0,
        oldestLedger: 0,
        oldestLedgerCloseTime: 0,
      };
      const mockContractAddress = 'mockContractAddress';

      beforeEach(() => {
        jest
          .spyOn(TransactionBuilder, 'fromXDR')
          .mockReturnValue(mockTransaction);
        jest
          .spyOn(service, 'getNetworkPassphrase')
          .mockReturnValue('networkPassphrase');
        jest
          .spyOn(stellarAdapter, 'executeTransactionWithRetry')
          .mockResolvedValue(mockDeployResponse);
        jest
          .spyOn(stellarAdapter, 'extractContractAddress')
          .mockReturnValue(mockContractAddress);
      });

      it('should return the contract address on successful upload', async () => {
        const result = await service.runUploadWASM({ signedTransactionXDR });

        expect(TransactionBuilder.fromXDR).toHaveBeenCalledWith(
          signedTransactionXDR,
          'networkPassphrase',
        );
        expect(stellarAdapter.executeTransactionWithRetry).toHaveBeenCalledWith(
          {
            transaction: mockTransaction,
          },
        );
        expect(stellarAdapter.extractContractAddress).toHaveBeenCalledWith({
          responseDeploy: mockDeployResponse,
        });
        expect(result).toBe(mockContractAddress);
      });
    });
  });
});
