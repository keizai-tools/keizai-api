import { xdr } from '@stellar/stellar-sdk';

import { Method } from '@/modules/method/domain/method.domain';

import {
  ContractErrorResponse,
  EncodeEvent,
  EventResponse,
  Param,
} from './soroban';

export const CONTRACT_MAPPER = 'CONTRACT_MAPPER';

export interface IStellarMapper {
  SCSpecTypeMap: {
    SC_SPEC_TYPE_BOOL: string;
    SC_SPEC_TYPE_ERROR: string;
    SC_SPEC_TYPE_U32: string;
    SC_SPEC_TYPE_I32: string;
    SC_SPEC_TYPE_U64: string;
    SC_SPEC_TYPE_I64: string;
    SC_SPEC_TYPE_TIMEPOINT: string;
    SC_SPEC_TYPE_DURATION: string;
    SC_SPEC_TYPE_U128: string;
    SC_SPEC_TYPE_I128: string;
    SC_SPEC_TYPE_U256: string;
    SC_SPEC_TYPE_I256: string;
    SC_SPEC_TYPE_BYTES: string;
    SC_SPEC_TYPE_STRING: string;
    SC_SPEC_TYPE_SYMBOL: string;
    SC_SPEC_TYPE_ADDRESS: string;
    SC_SPEC_TYPE_VEC: string;
    SC_SPEC_TYPE_MAP: string;
  };

  encodeEventToDisplayEvent(events: EncodeEvent[]): EventResponse[];
  getScValFromStellarAssetContract(
    selectedMethod: Partial<Method>,
  ): xdr.ScVal[];
  getParamsFromStellarAssetContract(selectedMethod: Partial<Method>): Param[];
  fromScValToDisplayValue(value: xdr.ScVal);
  fromTxResultToDisplayResponse(resultXdr: string): string;
  fromContractErrorToDisplayResponse(error: string): ContractErrorResponse;
}
