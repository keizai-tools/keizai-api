import { Inject, forwardRef } from '@nestjs/common';

import { EnvironmentMapper } from '@/modules/environment/application/mapper/environment.mapper';
import { FolderMapper } from '@/modules/folder/application/mapper/folder.mapper';
import { InvocationMapper } from '@/modules/invocation/application/mapper/invocation.mapper';

import { Collection } from '../../domain/collection.domain';
import { CollectionResponseDto } from '../dto/collection-response.dto';
import {
  ICollectionValues,
  IUpdateCollectionValues,
} from '../interface/collection.base.interface';

export class CollectionMapper {
  constructor(
    @Inject(forwardRef(() => FolderMapper))
    private readonly folderMapper: FolderMapper,
    @Inject(forwardRef(() => InvocationMapper))
    private readonly invocationMapper: InvocationMapper,
    @Inject(forwardRef(() => EnvironmentMapper))
    private readonly environmentMapper: EnvironmentMapper,
  ) {}

  fromDtoToEntity(collectionData: ICollectionValues): Collection {
    const { name, userId, teamId } = collectionData;
    return new Collection(name, userId, teamId);
  }

  fromUpdateDtoToEntity(collectionData: IUpdateCollectionValues): Collection {
    const { name, userId, teamId, id } = collectionData;
    return new Collection(name, userId, teamId, id);
  }

  fromEntityToDto(collection: Collection): CollectionResponseDto {
    const { name, id, folders, environments, invocations } = collection;
    const foldersMapped = folders?.map((folder) => {
      return this.folderMapper.fromEntityToDto(folder);
    });
    const environmentMapped = environments?.map((environment) => {
      return this.environmentMapper.fromEntityToDto(environment);
    });
    const invocationsMapped = invocations?.map((invocation) => {
      return this.invocationMapper.fromEntityToDto(invocation);
    });
    return new CollectionResponseDto(
      id,
      name,
      foldersMapped,
      invocationsMapped,
      environmentMapped,
    );
  }
}
