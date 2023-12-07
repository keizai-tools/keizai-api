import { Inject } from '@nestjs/common';

import { EnvironmentMapper } from '@/modules/enviroment/application/mapper/environment.mapper';
import { FolderMapper } from '@/modules/folder/application/mapper/folder.mapper';

import { Collection } from '../../domain/collection.domain';
import { CollectionResponseDto } from '../dto/collection-response.dto';
import {
  ICollectionValues,
  IUpdateCollectionValues,
} from '../service/collection.service';

export class CollectionMapper {
  constructor(
    @Inject(FolderMapper)
    private readonly folderMapper: FolderMapper,
    @Inject(EnvironmentMapper)
    private readonly environmentMapper: EnvironmentMapper,
  ) {}
  fromDtoToEntity(collectionData: ICollectionValues): Collection {
    const { name, userId } = collectionData;
    return new Collection(name, userId);
  }
  fromUpdateDtoToEntity(collectionData: IUpdateCollectionValues): Collection {
    const { name, userId, id } = collectionData;
    return new Collection(name, userId, id);
  }
  fromEntityToDto(collection: Collection): CollectionResponseDto {
    const { name, id, folders, environments } = collection;
    const foldersMapped = folders?.map((folder) => {
      return this.folderMapper.fromEntityToDto(folder);
    });
    const enviromentMapped = environments?.map((enviroment) => {
      return this.environmentMapper.fromEntityToDto(enviroment);
    });
    return new CollectionResponseDto(id, name, foldersMapped, enviromentMapped);
  }
}
