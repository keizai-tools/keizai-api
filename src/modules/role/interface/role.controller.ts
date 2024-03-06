import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  AuthUser,
  IUserResponse,
} from '@/modules/auth/infrastructure/decorators/auth.decorators';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';

import { CreateUserRoleToTeamDto } from '../application/dto/create-user-role.dto';
import { UpdateUserRoleToTeamDto } from '../application/dto/update-user-role.dto';
import { UserRoleOnTeamService } from '../application/service/role.service';

@Controller('role')
export class UserRoleToTeamController {
  constructor(private readonly userRoleOnTeamService: UserRoleOnTeamService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async findAllByUser(@AuthUser() user: IUserResponse) {
    return this.userRoleOnTeamService.findAllByUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findOneByIds(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.userRoleOnTeamService.findOneByIds(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @AuthUser() user: IUserResponse,
    @Body() createUserRoleToTeamDto: CreateUserRoleToTeamDto,
  ) {
    return this.userRoleOnTeamService.create(createUserRoleToTeamDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/')
  async update(
    @AuthUser() user: IUserResponse,
    @Body() updateUserRoleToTeamDto: UpdateUserRoleToTeamDto,
  ) {
    return this.userRoleOnTeamService.update(updateUserRoleToTeamDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.userRoleOnTeamService.delete(id, user.id);
  }
}
