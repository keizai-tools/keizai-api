import { Method } from '../../domain/method.domain';
import { MethodResponseDto } from '../dto/method-response.dto';
import { IMethodValues, IUpdateMethodValues } from '../service/method.service';

export class MethodMapper {
  fromDtoToEntity(createMethodDto: IMethodValues): Method {
    const { name, inputs, outputs, invocationId, userId } = createMethodDto;
    return new Method(name, inputs, outputs, invocationId, userId);
  }

  fromEntityToDto(param: Method): MethodResponseDto {
    const { name, inputs, outputs, id } = param;
    return new MethodResponseDto(name, inputs, outputs, id);
  }

  fromUpdateDtoToEntity(updateParamDto: IUpdateMethodValues): Method {
    const { name, inputs, outputs, invocationId, userId, id } = updateParamDto;
    return new Method(name, inputs, outputs, invocationId, userId, id);
  }

  fromGeneratedMethodToEntity(method: IMethodValues): Method {
    const { name, inputs, outputs, invocationId, userId } = method;
    return new Method(name, inputs, outputs, invocationId, userId);
  }
}
