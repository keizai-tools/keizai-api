import { IPromiseResponse } from '@/common/response_service/interface/response.interface';

import { User } from '../../domain/user.domain';
import { UpdateUserDto } from '../dto/update_user.dto';
import { IUpdateUserResponse } from './user.common.interfaces';

export interface IUserController {
  updateUser(
    updateUserDto: UpdateUserDto,
    user: User,
  ): IPromiseResponse<IUpdateUserResponse>;
  getMe(user: User): Promise<User>;
}
