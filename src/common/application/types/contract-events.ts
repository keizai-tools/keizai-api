import { Contract, xdr } from 'stellar-sdk';

interface BaseEventResponse {
  id: string;
  type: 'contract' | 'system' | 'diagnostic';
  ledger: number;
  ledgerClosedAt: string;
  pagingToken: string;
  inSuccessfulContractCall: boolean;
}
export interface EventResponse extends BaseEventResponse {
  contractId?: Contract;
  topic: xdr.ScVal[];
  value: xdr.ScVal;
}
