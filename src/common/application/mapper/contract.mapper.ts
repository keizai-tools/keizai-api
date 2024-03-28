import { nativeToScVal, scValToNative, xdr } from 'stellar-sdk';

import { Method } from '@/modules/method/domain/method.domain';

import { EventResponse } from '../types/contract-events';
import { SC_VAL_TYPE } from '../types/soroban.enum';

type Param = {
  value: string;
  type: any;
};
export class StellarMapper {
  SCSpecTypeMap = {
    SC_SPEC_TYPE_BOOL: 'b',
    SC_SPEC_TYPE_ERROR: 'error',
    SC_SPEC_TYPE_U32: 'u32',
    SC_SPEC_TYPE_I32: 'i32',
    SC_SPEC_TYPE_U64: 'u64',
    SC_SPEC_TYPE_I64: 'i64',
    SC_SPEC_TYPE_TIMEPOINT: 'timepoint',
    SC_SPEC_TYPE_DURATION: 'duration',
    SC_SPEC_TYPE_U128: 'u128',
    SC_SPEC_TYPE_I128: 'i128',
    SC_SPEC_TYPE_U256: 'u256',
    SC_SPEC_TYPE_I256: 'i256',
    SC_SPEC_TYPE_BYTES: 'bytes',
    SC_SPEC_TYPE_STRING: 'str',
    SC_SPEC_TYPE_SYMBOL: 'sym',
    SC_SPEC_TYPE_ADDRESS: 'address',
    SC_SPEC_TYPE_VEC: 'vec',
    SC_SPEC_TYPE_MAP: 'map',
  };

  encodeEventToDisplayEvent(events: EventResponse[]) {
    return events.map((event) => {
      return {
        type: event.type,
        ledger: event.ledger,
        ledgerClosedAt: event.ledgerClosedAt,
        id: event.id,
        pagingToken: event.pagingToken,
        topic: event.topic.map((topic) => {
          return scValToNative(topic);
        }),
        value: this.fromScValToDisplayValue(event.value),
        inSuccessfulContractCall: event.inSuccessfulContractCall,
        contractId: event.contractId?.contractId(),
      };
    });
  }

  getScValFromStellarAssetContract(selectedMethod: Method): xdr.ScVal[] {
    const params = this.getParamsFromStellarAssetContract(selectedMethod);
    return params.map((param) =>
      nativeToScVal(param.value, { type: param.type }),
    );
  }

  getParamsFromStellarAssetContract(selectedMethod: Method): Param[] {
    return selectedMethod.params.map((param) => {
      return {
        value: param.value,
        type: this.SCSpecTypeMap[
          selectedMethod.inputs.find((input) => input.name === param.name).type
        ],
      };
    });
  }

  fromScValToDisplayValue(value: xdr.ScVal) {
    switch (value.switch().name) {
      case SC_VAL_TYPE.STRING:
        return scValToNative(value);
      case SC_VAL_TYPE.ADDRESS:
        return scValToNative(value);
      case SC_VAL_TYPE.I128:
        return Number(scValToNative(value));
      case SC_VAL_TYPE.BOOL:
        return scValToNative(value);
      default:
        return value.value();
    }
  }
}
