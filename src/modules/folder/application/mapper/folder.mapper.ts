import { Inject, forwardRef } from '@nestjs/common';

import {
  IInvocationMapper,
  INVOCATION_MAPPER,
} from '@/modules/invocation/application/interface/invocation.mapper.interface';

import { Folder } from '../../domain/folder.domain';
import { FolderResponseDto } from '../dto/folder-response.dto';
import { IFolderMapper } from '../interface/folder.mapper.interface';
import {
  IFolderValues,
  IUpdateFolderValues,
} from '../interface/folder.service.interface';

export class FolderMapper implements IFolderMapper {
  constructor(
    @Inject(forwardRef(() => INVOCATION_MAPPER))
    private readonly invocationMapper: IInvocationMapper,
  ) {}
  fromDtoToEntity(createFolderDto: IFolderValues): Folder {
    const { name, collectionId } = createFolderDto;
    return new Folder(name, collectionId);
  }

  fromEntityToDto(folder: Folder): FolderResponseDto {
    const { name, id, invocations } = folder;
    const invocationsMapped = invocations?.map((invocation) =>
      this.invocationMapper.fromEntityToDto(invocation),
    );
    return new FolderResponseDto(name, id, invocationsMapped);
  }

  fromUpdateDtoToEntity(updateFolderDto: IUpdateFolderValues): Folder {
    const { name, collectionId, id } = updateFolderDto;
    return new Folder(name, collectionId, id);
  }
}
