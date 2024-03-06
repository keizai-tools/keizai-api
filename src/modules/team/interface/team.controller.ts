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
import { AuthTeamGuard } from '@/modules/auth/infrastructure/guard/auth-team.guard';
import { OwnerRoleGuard } from '@/modules/auth/infrastructure/guard/owner-role.guard';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';

import { CreateTeamDto } from '../application/dto/create-team.dto';
import { UpdateTeamDto } from '../application/dto/update-team.dto';
import { TeamService } from '../application/service/team.service';

@Controller('team')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('/')
  async findAllByUser(@AuthUser() user: IUserResponse) {
    return this.teamService.findAllByUser(user.id);
  }

  @UseGuards(AuthTeamGuard)
  @Get('/:teamId')
  async findOne(@Param('teamId') teamId: string) {
    return this.teamService.findOne(teamId);
  }

  @Post('/')
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @AuthUser() user: IUserResponse,
  ) {
    return this.teamService.create(createTeamDto, user);
  }

  @Patch('/')
  async update(
    @AuthUser() user: IUserResponse,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamService.update(updateTeamDto, user.id);
  }

  @UseGuards(OwnerRoleGuard)
  @Delete('/:teamId')
  async delete(
    @AuthUser() user: IUserResponse,
    @Param('teamId') teamId: string,
  ) {
    return this.teamService.delete(teamId, user.id);
  }
}
