import { Collection } from '../../domain/collection.domain';
import { CollectionResponseDto } from '../dto/collection-response.dto';
import {
  ICollectionValues,
  IUpdateCollectionValues,
} from './collection.service.interface';

export const COLLECTION_MAPPER = 'COLLECTION_MAPPER';

export interface ICollectionMapper {
  fromDtoToEntity(collectionData: ICollectionValues): Collection;
  fromUpdateDtoToEntity(collectionData: IUpdateCollectionValues): Collection;
  fromEntityToDto(collection: Collection): CollectionResponseDto;
}
