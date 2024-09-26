import { DeleteResult } from 'typeorm';

import { User } from '../../domain/user.domain';
import { IUpdateUserResponse } from './user.common.interfaces';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
  create(user: User): Promise<User>;
  update(id: string, user: Partial<User>): Promise<IUpdateUserResponse>;
  delete(id: string): Promise<DeleteResult>;
  findByEmail(email: string): Promise<User>;
  saveOne(user: User): Promise<User>;
  findByExternalId(externalId: string): Promise<User>;
  findById(id: string): Promise<User>;
  findAllByEmails(emails: string[]): Promise<User[]>;
}
