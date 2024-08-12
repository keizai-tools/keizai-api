import { IPromiseResponse } from '@/common/response_service/interface/response.interface';

import { UpdateUserDto } from '../dto/update_user.dto';
import { IUpdateUserResponse } from './user.common.interfaces';

export interface IUserController {
  updateUser(
    updateUserDto: UpdateUserDto,
  ): IPromiseResponse<IUpdateUserResponse>;
}
