import { Invocation } from '../../domain/invocation.domain';
import { UpdateInvocationDto } from '../dto/update-invocation.dto';

export const INVOCATION_EXCEPTION = 'INVOCATION_EXCEPTION';

export interface IInvocationException {
  validateInvocation(
    invocation: Invocation,
    updateInvocationDto: UpdateInvocationDto,
  ): void;
}
