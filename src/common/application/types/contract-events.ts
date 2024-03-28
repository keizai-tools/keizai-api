import { Contract, xdr } from 'stellar-sdk';

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
