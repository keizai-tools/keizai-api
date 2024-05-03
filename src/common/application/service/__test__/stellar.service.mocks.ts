import { Keypair, xdr } from '@stellar/stellar-sdk';

import {
  GetTransactionStatus,
  SOROBAN_SERVER,
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
  sac: 'CDI7KTHGYGX6U76745F74WKBS7N7TUSIADWJ3L4WFXCJF2LQT63M4YJW',
  smart: 'CBW5BTKZ6G2TLM646PGYMJLS6UMJOJI55ZHS34P4Q2S7Z7GSSJGR2OXA',
};

export async function getRandomKeypair() {
  const keypair = Keypair.random();

  const response = await fetch(
    `${SOROBAN_SERVER.FRIENDBOT_TESNET}${keypair.publicKey()}`,
  );

  if (response) {
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }
}
