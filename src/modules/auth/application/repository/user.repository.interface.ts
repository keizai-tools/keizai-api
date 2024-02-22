import { IBaseRepository } from '@/common/application/base.repository';

import { User } from '../../domain/user.domain';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository extends IBaseRepository<User> {
  findOneByexternalId(id: string): Promise<User>;
  findOneByEmail(email: string): Promise<User>;
  findAllByEmails(emails: string[]): Promise<User[]>;
}
