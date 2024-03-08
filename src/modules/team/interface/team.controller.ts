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
import { AdminRoleGuard } from '@/modules/auth/infrastructure/guard/admin-role.guard';
import { AuthTeamGuard } from '@/modules/auth/infrastructure/guard/auth-team.guard';
import { OwnerRoleGuard } from '@/modules/auth/infrastructure/guard/owner-role.guard';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';

import { CreateTeamDto } from '../application/dto/create-team.dto';
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

  @UseGuards(AuthTeamGuard)
  @Get('/:teamId/collections')
  async findCollectionsByTeam(@Param('teamId') teamId: string) {
    return this.teamService.findCollectionsByTeam(teamId);
  }

  @Post('/')
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @AuthUser() user: IUserResponse,
  ) {
    return this.teamService.create(createTeamDto, user);
  }

  @UseGuards(AdminRoleGuard)
  @Patch('/:teamId')
  async update(
    @AuthUser() user: IUserResponse,
    @Body() updateTeamDto: CreateTeamDto,
    @Param('teamId') teamId: string,
  ) {
    return this.teamService.update({ ...updateTeamDto, id: teamId }, user.id);
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
