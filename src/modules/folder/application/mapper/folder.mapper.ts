import { Inject } from '@nestjs/common';

import { InvocationMapper } from '@/modules/invocation/application/mapper/invocation.mapper';

import { Folder } from '../../domain/folder.domain';
import { FolderResponseDto } from '../dto/folder-response.dto';
import { IFolderValues } from '../service/folder.service';

export class FolderMapper {
  constructor(
    @Inject(InvocationMapper)
    private readonly invocationMapper: InvocationMapper,
  ) {}
  fromDtoToEntity(createFolderDto: IFolderValues): Folder {
    const { name, collectionId, userId } = createFolderDto;
    return new Folder(name, collectionId, userId);
  }

  fromEntityToDto(folder: Folder): FolderResponseDto {
    const { name, id, invocations } = folder;
    const invocationsMapped = invocations?.map((invocation) =>
      this.invocationMapper.fromEntityToDto(invocation),
    );
    return new FolderResponseDto(name, id, invocationsMapped);
  }

  fromUpdateDtoToEntity(updateFolderDto: IFolderValues): Folder {
    const { name, collectionId, userId, id } = updateFolderDto;
    return new Folder(name, collectionId, userId, id);
  }
}
