import { Method } from '../../domain/method.domain';
import { MethodResponseDto } from '../dto/method-response.dto';
import { IMethodValues } from '../service/method.service';

export class MethodMapper {
  fromDtoToEntity(createMethodDto: IMethodValues): Method {
    const { name, invocationId, userId } = createMethodDto;
    return new Method(name, invocationId, userId);
  }

  fromEntityToDto(param: Method): MethodResponseDto {
    const { name, id } = param;
    return new MethodResponseDto(name, id);
  }

  fromUpdateDtoToEntity(updateParamDto: IMethodValues): Method {
    const { name, invocationId, userId, id } = updateParamDto;
    return new Method(name, invocationId, userId, id);
  }
}
