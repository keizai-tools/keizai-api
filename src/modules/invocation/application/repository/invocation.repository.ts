import { IBaseRepository } from '@/common/application/base.repository';

import { Invocation } from '../../domain/invocation.domain';

export interface IInvocationRepository extends IBaseRepository<Invocation> {
  findAll(userId: string): Promise<Invocation[]>;
  findOneByIds(id: string, userId: string): Promise<Invocation>;
  update(invocation: Invocation): Promise<Invocation>;
  delete(id: string): Promise<boolean>;
}

export const INVOCATION_REPOSITORY = 'INVOCATION_REPOSITORY';
