import { DeleteResult } from 'typeorm';

import { Environment } from '../../domain/environment.domain';

export const ENVIRONMENT_REPOSITORY = 'ENVIRONMENT_REPOSITORY';

export interface IEnvironmentRepository {
  save(environment: Environment): Promise<Environment>;
  findOne(id: string): Promise<Environment>;
  findOneByEnvAndUserId(id: string, userId: string): Promise<Environment>;
  findOneByEnvAndTeamId(id: string, teamId: string): Promise<Environment>;
  findOneByName(name: string, collectionId: string): Promise<Environment>;
  findByNames(names: string[], collectionId: string): Promise<Environment[]>;
  update(environment: Environment): Promise<Environment>;
  delete(id: string): Promise<boolean>;
  deleteAll(ids: string[]): Promise<DeleteResult>;
  saveAll(environments: Environment[]): Promise<Environment[]>;
}
