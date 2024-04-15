import { xdr } from '@stellar/stellar-sdk';

import {
  GetTransactionStatus,
  SendTransactionStatus,
} from '../../types/soroban.enum';

export const contractExecutable: xdr.ContractExecutable = {
  switch: jest.fn(),
  wasmHash: jest.fn(),
  value: jest.fn(),
  toXDR: jest.fn(),
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
