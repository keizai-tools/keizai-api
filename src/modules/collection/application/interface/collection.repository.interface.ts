import { Collection } from '../../domain/collection.domain';

export const COLLECTION_REPOSITORY = 'COLLECTION_REPOSITORY';

export interface ICollectionRepository {
  findOne(id: string): Promise<Collection>;
  save(collection: Collection): Promise<Collection>;
  findAllByUser(userId: string): Promise<Collection[]>;
  findAllByTeam(teamId: string): Promise<Collection[]>;
  findOneByCollectionAndUserId(id: string, userId: string): Promise<Collection>;
  findOneByCollectionAndTeamId(id: string, teamId: string): Promise<Collection>;
  update(collection: Collection): Promise<Collection>;
  delete(id: string): Promise<boolean>;
}
