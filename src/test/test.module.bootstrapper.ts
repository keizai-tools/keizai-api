import { xdr } from '@stellar/stellar-sdk';

import { ICognitoAuthService } from '@/common/cognito/application/interface/cognito.service.interface';
import {
  GetTransactionStatus,
  SendTransactionStatus,
} from '@/common/stellar_service/application/domain/soroban.enum';

export const identityProviderServiceMock: jest.MockedObject<ICognitoAuthService> =
  {
    confirmPasswordReset: jest.fn(),
    confirmUserRegistration: jest.fn(),
    initiatePasswordReset: jest.fn(),
    loginUser: jest.fn(),
    refreshUserSession: jest.fn(),
    registerUser: jest.fn(),
    resendUserConfirmationCode: jest.fn(),
    getUserSub: jest.fn(),
  };

export const contractExecutable: xdr.ContractExecutable = {
  switch: jest.fn(),
  wasmHash: jest.fn(),
  value: jest.fn(),
  toXDR: jest.fn(),
};

export const mockedContractService = {
  runInvocation: jest.fn(),
  verifyNetwork: jest.fn(),
  changeNetwork: jest.fn(),
  generateMethodsFromContractId: jest.fn(),
};

export const getTxFailed = {
  status: GetTransactionStatus.FAILED,
  ledger: 0,
  createdAt: 0,
  applicationOrder: 0,
  feeBump: false,
  envelopeXdr: undefined,
  resultXdr: undefined,
  resultMetaXdr: undefined,
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

export const rawSendTxError = {
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
