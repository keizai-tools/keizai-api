import { PreInvocation } from '../../domain/pre-invocation.domain';
import { PreInvocationResponseDto } from '../dto/pre-invocation.response.dto';
import {
  IPreInvocationValues,
  IUpdatePreInvocationValues,
} from '../service/pre-invocation.service';

export class PreInvocationMapper {
  fromDtoToEntity(preInvocationDto: IPreInvocationValues): PreInvocation {
    const { code, invocationId, userId } = preInvocationDto;
    return new PreInvocation(code, invocationId, userId);
  }

  fromEntityToDto(preInvocation: PreInvocation): PreInvocationResponseDto {
    const { code, id } = preInvocation;
    return new PreInvocationResponseDto(code, id);
  }

  fromUpdateDtoToEntity(
    preInvocationDto: IUpdatePreInvocationValues,
  ): PreInvocation {
    const { code, invocationId, userId, id } = preInvocationDto;
    return new PreInvocation(code, invocationId, userId, id);
  }
}
