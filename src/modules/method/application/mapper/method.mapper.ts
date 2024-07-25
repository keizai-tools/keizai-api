import { Method } from '../../domain/method.domain';
import { MethodResponseDto } from '../dto/method-response.dto';
import { IMethodMapper } from '../interface/method.mapper.interface';
import {
  IMethodValues,
  IUpdateMethodValues,
} from '../interface/method.service.interface';

export class MethodMapper implements IMethodMapper {
  fromDtoToEntity(createMethodDto: IMethodValues | Partial<Method>): Method {
    const { name, inputs, outputs, invocationId, params, docs } =
      createMethodDto;
    return new Method(name, inputs, outputs, params, docs, invocationId);
  }

  fromEntityToDto(method: Method): MethodResponseDto {
    const { name, inputs, outputs, params, docs, id } = method;
    return new MethodResponseDto(name, inputs, outputs, params, docs, id);
  }

  fromUpdateDtoToEntity(updateParamDto: IUpdateMethodValues): Method {
    const { name, inputs, outputs, params, docs, invocationId, id } =
      updateParamDto;
    return new Method(name, inputs, outputs, params, docs, invocationId, id);
  }

  fromGeneratedMethodToEntity(method: IMethodValues): Method {
    const { name, inputs, outputs, docs, invocationId } = method;
    const paramsValue = inputs.map((input) => {
      return {
        name: input.name,
        value: '',
      };
    });

    return new Method(name, inputs, outputs, paramsValue, docs, invocationId);
  }
}
