import { Invocation } from '../../domain/invocation.domain';
import { InvocationResponseDto } from '../dto/invocation-response.dto';
import { UpdateInvocationDto } from '../dto/update-invocation.dto';
import {
  IInvocationValues,
  IUpdateInvocationValues,
} from './invocation.service.interface';

export const INVOCATION_MAPPER = 'INVOCATION_MAPPER';

export interface IInvocationMapper {
  fromDtoToEntity(createInvocationDto: IInvocationValues): Invocation;

  fromEntityToDto(invocation: Invocation): InvocationResponseDto;

  fromUpdateDtoToEntity(
    updateInvocationDto: IUpdateInvocationValues,
  ): Invocation;

  fromUpdateDtoToInvocationValues(
    updateInvocationDto: UpdateInvocationDto,
  ): IUpdateInvocationValues;
}
