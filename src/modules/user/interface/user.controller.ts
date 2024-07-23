import { Body, Controller, Get, Inject, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IPromiseResponse } from '@/common/response_service/interface/response.interface';

import { CurrentUser } from '../application/decorator/current_user.decorator';
import { UpdateUserDto } from '../application/dto/update_user.dto';
import { IUpdateUserResponse } from '../application/interfaces/user.common.interfaces';
import { IUserController } from '../application/interfaces/user.controller.interface';
import {
  IUserService,
  USER_SERVICE,
} from '../application/interfaces/user.service.interfaces';
import { User } from '../domain/user.domain';

@ApiTags('user')
@Controller('user')
export class UserController implements IUserController {
  constructor(
    @Inject(USER_SERVICE)
    private userService: IUserService,
  ) {}

  @Put('/update')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
  ): IPromiseResponse<IUpdateUserResponse> {
    return this.userService.updateUser(updateUserDto);
  }

  @Get('/me')
  async getMe(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
