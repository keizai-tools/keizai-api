import { IBaseRepository } from '@/common/application/base.repository';

import { User } from '../../domain/user.domain';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository extends IBaseRepository<User> {
  findOneByExternalId(id: string): Promise<User>;
}
