import { IBaseRepository } from '@/common/application/base.repository';

import { Invocation } from '../../domain/invocation.domain';

export interface IInvocationRepository extends IBaseRepository<Invocation> {
  findAll(userId: number): Promise<Invocation[]>;
  findOneByIds(id: number, userId: number): Promise<Invocation>;
  update(folder: Invocation): Promise<Invocation>;
  delete(id: number): Promise<boolean>;
}

export const INVOCATION_REPOSITORY = 'INVOCATION_REPOSITORY';
