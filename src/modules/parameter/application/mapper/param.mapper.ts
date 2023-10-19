import { Param } from '../../domain/param.domain';
import { ParamResponseDto } from '../dto/param-response.dto';
import { IParamValues } from '../service/param.service';

export class ParamMapper {
  fromDtoToEntity(createParamDto: IParamValues): Param {
    const { name, value, invocationId, userId } = createParamDto;
    return new Param(name, value, invocationId, userId);
  }

  fromEntityToDto(param: Param): ParamResponseDto {
    const { name, value, id } = param;
    return new ParamResponseDto(name, value, id);
  }

  fromUpdateDtoToEntity(updateParamDto: IParamValues): Param {
    const { name, value, invocationId, userId, id } = updateParamDto;
    return new Param(name, value, invocationId, userId, id);
  }
}
