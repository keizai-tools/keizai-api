import { rpc, xdr } from '@stellar/stellar-sdk';

import { ICognitoAuthService } from '@/common/cognito/application/interface/cognito.service.interface';
import {
  GetTransactionStatus,
  SendTransactionStatus,
} from '@/common/stellar_service/application/domain/soroban.enum';
import { IStellarService } from '@/common/stellar_service/application/interface/contract.service.interface';
import type { IStellarAdapter } from '@/common/stellar_service/application/interface/stellar.adapter.interface';

export const identityProviderServiceMock: jest.MockedObject<ICognitoAuthService> =
  {
    confirmPasswordReset: jest.fn(),
    confirmUserRegistration: jest.fn(),
    initiatePasswordReset: jest.fn(),
    loginUser: jest.fn(),
    refreshSession: jest.fn(),
    registerUser: jest.fn(),
    resendUserConfirmationCode: jest.fn(),
    getUserSub: jest.fn(),
    changePassword: jest.fn(),
  };

export const mockedAdapterContract: jest.MockedObject<IStellarAdapter> = {
  changeNetwork: jest.fn(),
  checkContractNetwork: jest.fn(),
  createContractSpec: jest.fn(),
  createDeployContractOperation: jest.fn(),
  executeTransactionWithRetry: jest.fn(),
  extractContractAddress: jest.fn(),
  getAccountOrFund: jest.fn(),
  getContractEvents: jest.fn(),
  getInstanceValue: jest.fn(),
  getKeypair: jest.fn(),
  getScSpecEntryFromXDR: jest.fn(),
  getTransaction: jest.fn(),
  getWasmCode: jest.fn(),
  prepareTransaction: jest.fn(),
  prepareUploadWASM: jest.fn(),
  sendTransaction: jest.fn(),
  signTransaction: jest.fn(),
  uploadWasm: jest.fn(),
};

export const contractExecutable: xdr.ContractExecutable = {
  switch: jest.fn(),
  wasmHash: jest.fn(),
  value: jest.fn(),
  toXDR: jest.fn(),
};

export const mockedContractService: jest.MockedObject<IStellarService> = {
  runInvocation: jest.fn(),
  verifyNetwork: jest.fn(),
  generateMethodsFromContractId: jest.fn(),
  deployWasmFile: jest.fn(),
  getPreparedTransactionXDR: jest.fn(),
  prepareUploadWASM: jest.fn(),
  runUploadWASM: jest.fn(),
  getContractSpecEntries: jest.fn(),
  getScValFromSmartContract: jest.fn(),
  extractFunctionInfo: jest.fn(),
  getStellarAssetContractFunctions: jest.fn(),
  generateScArgsToFromContractId: jest.fn(),
  pollTransactionStatus: jest.fn(),
};

export const getTxFailed: rpc.Api.GetTransactionResponse = {
  status: GetTransactionStatus.FAILED,
  ledger: 0,
  createdAt: 0,
  applicationOrder: 0,
  feeBump: false,
  envelopeXdr: undefined,
  resultXdr: undefined,
  resultMetaXdr: undefined,
  txHash: '',
  latestLedger: 0,
  latestLedgerCloseTime: 0,
  oldestLedger: 0,
  oldestLedgerCloseTime: 0,
};

export const rawGetTxFailed = {
  status: GetTransactionStatus.FAILED,
  resultXdr: '',
  latestLedger: 0,
  latestLedgerCloseTime: 0,
  oldestLedger: 0,
  oldestLedgerCloseTime: 0,
};

export const rawSendTxPending = {
  status: SendTransactionStatus.PENDING,
  errorResultXdr: '',
  hash: '',
  latestLedger: 0,
  latestLedgerCloseTime: 0,
};

export const rawSendTxError: rpc.Api.RawSendTransactionResponse = {
  status: SendTransactionStatus.ERROR,
  errorResultXdr: '',
  hash: '',
  latestLedger: 0,
  latestLedgerCloseTime: 0,
};

export const selectedMethod = {
  smart: {
    name: 'increment',
    inputs: [],
    outputs: [
      {
        type: 'SC_SPEC_TYPE_U32',
      },
    ],
    params: [],
    docs: null,
    id: '41e62067',
  },
  sac: {
    name: 'symbol',
    inputs: [],
    outputs: [
      {
        type: 'SC_SPEC_TYPE_STRING',
      },
    ],
    params: [],
    docs: null,
    id: '00d501f0-46cf-4c50-83f9-41ca299ff6a1',
  },
};

export const contracts = {
  sac: 'CD6ZUMPDGJLXJGMKBEMATOFTES7B7VLWPEDKQKLNMWKV7IDJWYDKHK75',
  smart: 'CBZWGTHBZMJGXAQ3WTANSAGUNX5J6H4UHVVUMVZXMJIGMAHTOQVRFANO',
};
