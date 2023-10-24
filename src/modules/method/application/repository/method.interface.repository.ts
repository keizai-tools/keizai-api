import { IBaseRepository } from '@/common/application/base.repository';

import { Method } from '../../domain/method.domain';

export interface IMethodRepository extends IBaseRepository<Method> {
  findAll(userId: string): Promise<Method[]>;
  findOneByIds(id: string, userId: string): Promise<Method>;
  update(param: Method): Promise<Method>;
  delete(id: string): Promise<boolean>;
  deleteByInvocationId(invocationId: string): Promise<boolean>;
}

export const METHOD_REPOSITORY = 'METHOD_REPOSITORY';
