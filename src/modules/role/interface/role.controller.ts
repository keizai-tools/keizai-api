import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  IPromiseResponse,
  IResponse,
} from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';
import { CurrentUser } from '@/modules/user/application/decorator/current_user.decorator';
import { User } from '@/modules/user/domain/user.domain';

import { CreateUserRoleToTeamDto } from '../application/dto/create-user-role.dto';
import { ResponseUserRoletoTeamDto } from '../application/dto/response-user-role.dto';
import { UpdateUserRoleToTeamDto } from '../application/dto/update-user-role.dto';
import { UserRoleOnTeamService } from '../application/service/role.service';
import { UserRoleToTeam } from '../domain/role.domain';

@Auth(AuthType.Bearer)
@ApiTags('Role')
@Controller('role')
export class UserRoleToTeamController {
  constructor(private readonly userRoleOnTeamService: UserRoleOnTeamService) {}

  @Get('/')
  async findAllByUser(
    @CurrentUser() user: User,
  ): IPromiseResponse<ResponseUserRoletoTeamDto[]> {
    return this.userRoleOnTeamService.findAllByUser(user.id);
  }

  @Get('/:id')
  async findOneByIds(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<ResponseUserRoletoTeamDto> {
    return this.userRoleOnTeamService.findOneByIds(id, data.payload.id);
  }

  @Post('/')
  async create(
    @CurrentUser() data: IResponse<User>,
    @Body() createUserRoleToTeamDto: CreateUserRoleToTeamDto,
  ): IPromiseResponse<UserRoleToTeam> {
    return this.userRoleOnTeamService.create(
      createUserRoleToTeamDto,
      data.payload.id,
    );
  }

  @Patch('/')
  async update(
    @CurrentUser() data: IResponse<User>,
    @Body() updateUserRoleToTeamDto: UpdateUserRoleToTeamDto,
  ): IPromiseResponse<UserRoleToTeam> {
    return this.userRoleOnTeamService.update(
      updateUserRoleToTeamDto,
      data.payload.id,
    );
  }

  @Delete('/:id')
  async delete(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<boolean> {
    return this.userRoleOnTeamService.delete(id, data.payload.id);
  }
}
