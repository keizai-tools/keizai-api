import { IBaseRepository } from '@/common/application/base.repository';

import { Collection } from '../../domain/collection.domain';

export interface ICollectionRepository extends IBaseRepository<Collection> {
  findAllByUser(userId: string): Promise<Collection[]>;
  findAllByTeam(teamId: string): Promise<Collection[]>;
  findOneByCollectionAndUserId(id: string, userId: string): Promise<Collection>;
  findOneByCollectionAndTeamId(id: string, teamId: string): Promise<Collection>;
  update(collection: Collection): Promise<Collection>;
  delete(id: string): Promise<boolean>;
}

export const COLLECTION_REPOSITORY = 'COLLECTION_REPOSITORY';
