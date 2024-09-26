import { Invocation } from '../../domain/invocation.domain';

export const INVOCATION_REPOSITORY = 'INVOCATION_REPOSITORY';

export interface IInvocationRepository {
  findOne(id: string): Promise<Invocation>;
  save(invocation: Invocation): Promise<Invocation>;
  findAll(userId: string): Promise<Invocation[]>;
  findOneByIds(id: string, userId: string): Promise<Invocation>;
  update(invocation: Invocation): Promise<Invocation>;
  delete(id: string): Promise<boolean>;
}
