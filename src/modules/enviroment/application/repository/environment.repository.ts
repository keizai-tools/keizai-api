import { IBaseRepository } from '@/common/application/base.repository';

import { Environment } from '../../domain/environment.domain';

export interface IEnvironmentRepository extends IBaseRepository<Environment> {
  findAll(userId: string): Promise<Environment[]>;
  findOneByIds(id: string, userId: string): Promise<Environment>;
  update(environment: Environment): Promise<Environment>;
  delete(id: string): Promise<boolean>;
}

export const ENVIRONMENT_REPOSITORY = 'ENVIRONMENT_REPOSITORY';
