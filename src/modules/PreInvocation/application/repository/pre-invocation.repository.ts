import { IBaseRepository } from '@/common/application/base.repository';

import { PreInvocation } from '../../domain/pre-invocation.domain';

export interface IPreInvocationRepository
  extends IBaseRepository<PreInvocation> {
  findAll(userId: string): Promise<PreInvocation[]>;
  findOneByIds(id: string, userId: string): Promise<PreInvocation>;
  update(preInvocation: PreInvocation): Promise<PreInvocation>;
  delete(id: string): Promise<boolean>;
}

export const PRE_INVOCATION_REPOSITORY = 'PRE_INVOCATION_REPOSITORY';
