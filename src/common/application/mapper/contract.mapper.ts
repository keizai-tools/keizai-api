import { nativeToScVal, scValToNative, xdr } from '@stellar/stellar-sdk';

import {
  ContractErrorResponse,
  EncodeEvent,
  EventResponse,
  Param,
} from '../types/soroban';
import {
  SC_VAL_TYPE,
  SOROBAN_CONTRACT_ERROR,
  SendTransactionStatus,
} from '../types/soroban.enum';

export class StellarMapper {
  encodeEventToDisplayEvent(events: EncodeEvent[]): EventResponse[] {
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

  getNativeToScVal(param: Param) {
    return nativeToScVal(param.value, { type: param.type });
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

  fromTxResultToDisplayResponse(resultXdr: string): string {
    return xdr.TransactionResult.fromXDR(resultXdr, 'base64').result().switch()
      .name;
  }

  fromContractErrorToDisplayResponse(error: string): ContractErrorResponse {
    // This regex separates the cause and the event of the error
    const regex = /Caused by:(.*?)(?=Backtrace|$)/s;
    const match = error.match(regex);

    if (match) {
      return {
        status: SendTransactionStatus.ERROR,
        title: SOROBAN_CONTRACT_ERROR.HOST_FAILED,
        response: match[0],
      };
    }

    return {
      status: SendTransactionStatus.ERROR,
      title: SOROBAN_CONTRACT_ERROR.HOST_FAILED,
      response: error,
    };
  }
}
