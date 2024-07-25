import { NotFoundException } from '@nestjs/common';

import { Invocation } from '../../domain/invocation.domain';
import { UpdateInvocationDto } from '../dto/update-invocation.dto';
import { IInvocationException } from '../interface/invocation.exceptions.interface';
import { INVOCATION_RESPONSE } from './invocation-response.enum.dto';

export class InvocationException implements IInvocationException {
  validateInvocation(
    invocation: Invocation,
    updateInvocationDto: UpdateInvocationDto,
  ): void {
    if (!invocation) {
      throw new NotFoundException(
        INVOCATION_RESPONSE.Invocation_NOT_FOUND_BY_USER_AND_ID,
      );
    }
    if (updateInvocationDto.selectedMethodId && !invocation.contractId) {
      throw new NotFoundException(
        INVOCATION_RESPONSE.INVOCATION_FAIL_SELECTING_METHOD_WITHOUT_CONTRACT,
      );
    }
    if (
      updateInvocationDto.selectedMethodId &&
      updateInvocationDto.contractId
    ) {
      throw new NotFoundException(
        INVOCATION_RESPONSE.INVOCATION_FAIL_WITH_NEW_CONTRACT_AND_NEW_METHOD,
      );
    }
  }
}
