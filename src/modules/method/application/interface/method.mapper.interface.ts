import { Method } from '../../domain/method.domain';
import { MethodResponseDto } from '../dto/method-response.dto';
import { IMethodValues, IUpdateMethodValues } from './method.service.interface';

export const METHOD_MAPPER = 'METHOD_MAPPER';

export interface IMethodMapper {
  fromGeneratedMethodToEntity(method: IMethodValues): Method;
  fromUpdateDtoToEntity(updateParamDto: IUpdateMethodValues): Method;
  fromEntityToDto(method: Method): MethodResponseDto;
  fromDtoToEntity(createMethodDto: IMethodValues | Partial<Method>): Method;
}
