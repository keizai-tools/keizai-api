import { Method } from '../../domain/method.domain';
import { MethodResponseDto } from '../dto/method-response.dto';
import { IMethodValues, IUpdateMethodValues } from '../service/method.service';

export class MethodMapper {
  fromDtoToEntity(createMethodDto: IMethodValues): Method {
    const { name, inputs, outputs, invocationId, docs, userId } =
      createMethodDto;
    return new Method(name, inputs, outputs, docs, invocationId, userId);
  }

  fromEntityToDto(param: Method): MethodResponseDto {
    const { name, inputs, outputs, docs, id } = param;
    return new MethodResponseDto(name, inputs, outputs, docs, id);
  }

  fromUpdateDtoToEntity(updateParamDto: IUpdateMethodValues): Method {
    const { name, inputs, outputs, docs, invocationId, userId, id } =
      updateParamDto;
    return new Method(name, inputs, outputs, docs, invocationId, userId, id);
  }

  fromGeneratedMethodToEntity(method: IMethodValues): Method {
    const { name, inputs, outputs, docs, invocationId, userId } = method;
    return new Method(name, inputs, outputs, docs, invocationId, userId);
  }
}
