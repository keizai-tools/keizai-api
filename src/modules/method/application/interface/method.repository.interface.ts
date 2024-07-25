import { DeleteResult } from 'typeorm';

import { Method } from '../../domain/method.domain';

export const METHOD_REPOSITORY = 'METHOD_REPOSITORY';

export interface IMethodRepository {
  findOne(id: string): Promise<Method>;
  save(method: Method): Promise<Method>;
  saveAll(methods: Method[]): Promise<Method[]>;
  findAllByInvocationId(invocationId: string): Promise<Method[]>;
  findOneByIds(id: string, userId: string): Promise<Method>;
  update(param: Method): Promise<Method>;
  delete(id: string): Promise<boolean>;
  deleteAll(ids: string[]): Promise<DeleteResult>;
}
