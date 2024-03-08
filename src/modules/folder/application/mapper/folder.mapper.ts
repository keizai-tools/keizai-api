import { Inject, forwardRef } from '@nestjs/common';

import { InvocationMapper } from '@/modules/invocation/application/mapper/invocation.mapper';

import { Folder } from '../../domain/folder.domain';
import { FolderResponseDto } from '../dto/folder-response.dto';
import { IFolderValues, IUpdateFolderValues } from '../service/folder.service';

export class FolderMapper {
  constructor(
    @Inject(forwardRef(() => InvocationMapper))
    private readonly invocationMapper: InvocationMapper,
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
