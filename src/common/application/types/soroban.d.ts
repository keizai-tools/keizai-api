import {
  Contract,
  Memo,
  MemoType,
  Operation,
  SorobanRpc,
  Transaction as Tx,
  xdr,
} from 'stellar-sdk';

export type Transaction = Tx<Memo<MemoType>, Operation[]>;

export type GetTransactionResponse = SorobanRpc.Api.GetTransactionResponse;

export type RawSendTransactionResponse =
  SorobanRpc.Api.RawSendTransactionResponse;

export type RawGetTransactionResponse =
  SorobanRpc.Api.RawGetTransactionResponse;

interface BaseEventResponse {
  id: string;
  type: 'contract' | 'system' | 'diagnostic';
  ledger: number;
  ledgerClosedAt: string;
  pagingToken: string;
  inSuccessfulContractCall: boolean;
}
export interface EncodeEvent extends BaseEventResponse {
  contractId?: Contract;
  topic: xdr.ScVal[];
  value: xdr.ScVal;
}

export interface EventResponse extends BaseEventResponse {
  contractId: string;
  topic: any[];
  value: any;
}
export interface SorobanContractErrorResponse {
  status: string;
  title: string;
  response: string;
}

export type Param = {
  value: string;
  type: any;
};
