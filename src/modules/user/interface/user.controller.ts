import { Body, Controller, Get, Inject, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  IPromiseResponse,
  IResponse,
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';

import { CurrentUser } from '../application/decorator/current_user.decorator';
import { UpdateUserDto } from '../application/dto/update_user.dto';
import { IUpdateUserResponse } from '../application/interfaces/user.common.interfaces';
import { IUserController } from '../application/interfaces/user.controller.interface';
import {
  IUserService,
  USER_SERVICE,
} from '../application/interfaces/user.service.interfaces';
import { User } from '../domain/user.domain';

@Auth(AuthType.Bearer)
@ApiTags('User')
@Controller('user')
export class UserController implements IUserController {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
  ) {}

  @Put('/update')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ): IPromiseResponse<IUpdateUserResponse> {
    return this.userService.updateUser(updateUserDto, user);
  }

  @Get('/me')
  async getMe(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Get('/fargate-time')
  async getFargateTime(
    @CurrentUser() user: IResponse<User>,
  ): Promise<IPromiseResponse<{ fargateTime: number }>> {
    const fargateTime = await this.userService.getFargateSessionTime(
      user.payload.id,
    );
    return this.responseService.createResponse({
      type: 'OK',
      message: 'Fargate session time calculated successfully.',
      payload: { fargateTime },
    });
  }

  @Get('/fargate-cost-per-minute') getFargateCostPerMinute(): IResponse<{
    costPerMinute: number;
  }> {
    const costPerMinute = this.userService.getFargateCostPerMinute();
    return this.responseService.createResponse({
      type: 'OK',
      message: 'Fargate cost per minute calculated successfully.',
      payload: { costPerMinute },
    });
  }

  @Post('update-balance')
  async updateBalance(
    @CurrentUser() user: IResponse<User>,
    @Body('interval') interval: number,
  ): Promise<string> {
    await this.userService.updateUserBalance(user.payload.id, interval);
    return 'User balance updated successfully';
  }
}
