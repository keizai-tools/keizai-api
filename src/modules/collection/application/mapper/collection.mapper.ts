import { Collection } from '../../domain/collection.domain';
import { CollectionResponseDto } from '../dto/collection-response.dto';
import {
  ICollectionValues,
  IUpdateCollectionValues,
} from '../service/collection.service';

export class CollectionMapper {
  fromDtoToEntity(collectionData: ICollectionValues): Collection {
    const { name, userId } = collectionData;
    return new Collection(name, userId);
  }
  fromUpdateDtoToEntity(collectionData: IUpdateCollectionValues): Collection {
    const { name, userId, id } = collectionData;
    return new Collection(name, userId, id);
  }
  fromEntityToDto(collection: Collection): CollectionResponseDto {
    const { name, id } = collection;
    return new CollectionResponseDto(id, name);
  }
}
