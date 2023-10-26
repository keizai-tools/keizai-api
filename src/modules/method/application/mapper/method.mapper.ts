import { Method } from '../../domain/method.domain';
import { MethodResponseDto } from '../dto/method-response.dto';
import { IMethodValues, IUpdateMethodValues } from '../service/method.service';

export class MethodMapper {
  fromDtoToEntity(createMethodDto: IMethodValues): Method {
    const { name, inputs, outputs, invocationId, params, docs, userId } =
      createMethodDto;
    return new Method(
      name,
      inputs,
      outputs,
      params,
      docs,
      invocationId,
      userId,
    );
  }

  fromEntityToDto(method: Method): MethodResponseDto {
    const { name, inputs, outputs, params, docs, id } = method;
    return new MethodResponseDto(name, inputs, outputs, params, docs, id);
  }

  fromUpdateDtoToEntity(updateParamDto: IUpdateMethodValues): Method {
    const { name, inputs, outputs, params, docs, invocationId, userId, id } =
      updateParamDto;
    return new Method(
      name,
      inputs,
      outputs,
      params,
      docs,
      invocationId,
      userId,
      id,
    );
  }

  fromGeneratedMethodToEntity(method: IMethodValues): Method {
    const { name, inputs, outputs, docs, invocationId, userId } = method;
    const paramsValue = inputs.map((input) => {
      return {
        name: input.name,
        value: '',
      };
    });

    return new Method(
      name,
      inputs,
      outputs,
      paramsValue,
      docs,
      invocationId,
      userId,
    );
  }
}
