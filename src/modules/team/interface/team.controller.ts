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

import { CreateTeamDto } from '../application/dto/create-team.dto';
import { UpdateTeamDto } from '../application/dto/update-team.dto';
import { TeamService } from '../application/service/team.service';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async findAllByUser(@AuthUser() user: IUserResponse) {
    return this.teamService.findAllByUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return this.teamService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/collections')
  async findCollectionsByTeam(@Param('id') id: string) {
    return this.teamService.findCollectionsByTeam(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @AuthUser() user: IUserResponse,
  ) {
    return this.teamService.create(createTeamDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/')
  async update(
    @AuthUser() user: IUserResponse,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamService.update(updateTeamDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.teamService.delete(id, user.id);
  }
}
