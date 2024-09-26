import { IPromiseResponse } from '@/common/response_service/interface/response.interface';

import { User } from '../../domain/user.domain';
import { UpdateUserDto } from '../dto/update_user.dto';
import { IUpdateUserResponse } from './user.common.interfaces';

export const USER_SERVICE = 'USER_SERVICE';

export interface IUserService {
  createUser(user: UpdateUserDto): IPromiseResponse<User>;
  getUserByEmail(email: string, error?: boolean): IPromiseResponse<User>;
  getUserByExternalId(
    externalId: string,
    error?: boolean,
  ): IPromiseResponse<User>;
  updateUser(
    updateUserDto: UpdateUserDto,
    user: User,
  ): IPromiseResponse<IUpdateUserResponse>;
  findAllByEmails(emails: string[]): IPromiseResponse<User[]>;
}
