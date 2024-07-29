import { Inject, forwardRef } from '@nestjs/common';

import {
  ENVIROMENT_MAPPER,
  IEnviromentMapper,
} from '@/modules/enviroment/application/interface/enviroment.mapper.interface';
import {
  FOLDER_MAPPER,
  IFolderMapper,
} from '@/modules/folder/application/interface/folder.mapper.interface';

import { Collection } from '../../domain/collection.domain';
import { CollectionResponseDto } from '../dto/collection-response.dto';
import {
  ICollectionValues,
  IUpdateCollectionValues,
} from '../interface/collection.base.interface';

export class CollectionMapper {
  constructor(
    @Inject(forwardRef(() => FOLDER_MAPPER))
    private readonly folderMapper: IFolderMapper,
    @Inject(forwardRef(() => ENVIROMENT_MAPPER))
    private readonly enviromentMapper: IEnviromentMapper,
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
    const { name, id, folders, enviroments } = collection;
    const foldersMapped = folders?.map((folder) => {
      return this.folderMapper.fromEntityToDto(folder);
    });
    const enviromentMapped = enviroments?.map((enviroment) => {
      return this.enviromentMapper.fromEntityToDto(enviroment);
    });
    return new CollectionResponseDto(id, name, foldersMapped, enviromentMapped);
  }
}
