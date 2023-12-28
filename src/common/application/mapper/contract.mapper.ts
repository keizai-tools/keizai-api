import { scValToNative } from 'stellar-sdk';

import { EventResponse } from '../types/contract-events';

export function encodeEventToDisplayEvent(events: EventResponse[]) {
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
      value: scValToNative(event.value),
      inSuccessfulContractCall: event.inSuccessfulContractCall,
      contractId: event.contractId?.contractId(),
    };
  });
}
