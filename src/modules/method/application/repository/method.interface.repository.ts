import { DeleteResult } from 'typeorm';

import { IBaseRepository } from '@/common/application/base.repository';

import { Method } from '../../domain/method.domain';

export interface IMethodRepository extends IBaseRepository<Method> {
  saveAll(methods: Method[]): Promise<Method[]>;
  findAll(userId: string): Promise<Method[]>;
  findAllByInvocationId(invocationId: string): Promise<Method[]>;
  findOneByIds(id: string, userId: string): Promise<Method>;
  update(param: Method): Promise<Method>;
  delete(id: string): Promise<boolean>;
  deleteAll(ids: string[]): Promise<DeleteResult>;
}

export const METHOD_REPOSITORY = 'METHOD_REPOSITORY';
