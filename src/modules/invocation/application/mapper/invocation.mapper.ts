import { Inject } from '@nestjs/common';

import { ParamMapper } from '@/modules/parameter/application/mapper/param.mapper';

import { Invocation } from '../../domain/invocation.domain';
import { InvocationResponseDto } from '../dto/invocation-response.dto';
import { IInvocationValues } from '../service/invocation.service';

export class InvocationMapper {
  constructor(
    @Inject(ParamMapper)
    private readonly paramMapper: ParamMapper,
  ) {}

  fromDtoToEntity(createFolderDto: IInvocationValues): Invocation {
    const { name, method, contractId, folderId, userId } = createFolderDto;
    return new Invocation(name, method, contractId, folderId, userId);
  }

  fromEntityToDto(folder: Invocation): InvocationResponseDto {
    const { name, method, contractId, params, id } = folder;
    const paramsMapped = params?.map((param) =>
      this.paramMapper.fromEntityToDto(param),
    );
    return new InvocationResponseDto(
      name,
      method,
      contractId,
      paramsMapped,
      id,
    );
  }

  fromUpdateDtoToEntity(updateFolderDto: IInvocationValues): Invocation {
    const { name, method, contractId, folderId, id, userId } = updateFolderDto;
    return new Invocation(name, method, contractId, folderId, userId, id);
  }
}
