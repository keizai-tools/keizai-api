import { IBaseRepository } from '@/common/application/base.repository';

import { Collection } from '../../domain/collection.domain';

export interface ICollectionRepository extends IBaseRepository<Collection> {
  findAllByUser(userId: number): Promise<Collection[]>;
  findOneByIds(id: number, userId: number): Promise<Collection>;
  update(collection: Collection): Promise<Collection>;
  delete(id: number): Promise<boolean>;
}

export const COLLECTION_REPOSITORY = 'COLLECTION_REPOSITORY';
