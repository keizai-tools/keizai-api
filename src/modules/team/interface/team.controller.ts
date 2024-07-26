import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import {
  IPromiseResponse,
  IResponse,
} from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';
import { CurrentUser } from '@/modules/user/application/decorator/current_user.decorator';
import { User } from '@/modules/user/domain/user.domain';

import { CreateTeamDto } from '../application/dto/create-team.dto';
import { TeamResponseDto } from '../application/dto/response-team.dto';
import {
  ITeamService,
  TEAM_SERVICE,
} from '../application/interface/team.service.interface';

@Auth(AuthType.Bearer)
@Controller('team')
export class TeamController {
  constructor(
    @Inject(TEAM_SERVICE)
    private readonly teamService: ITeamService,
  ) {}

  @Get('/')
  async findAllByUser(
    @CurrentUser() user: User,
  ): IPromiseResponse<TeamResponseDto[]> {
    return this.teamService.findAllByUser(user.id);
  }

  @Get('/:teamId')
  async findOne(
    @Param('teamId') teamId: string,
  ): IPromiseResponse<TeamResponseDto> {
    return this.teamService.findOne(teamId);
  }

  @Post('/')
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @CurrentUser() data: IResponse<User>,
  ): IPromiseResponse<TeamResponseDto> {
    return this.teamService.create(createTeamDto, data.payload);
  }

  @Patch('/:teamId')
  async update(
    @CurrentUser() data: IResponse<User>,
    @Body() updateTeamDto: CreateTeamDto,
    @Param('teamId') teamId: string,
  ): IPromiseResponse<TeamResponseDto> {
    return this.teamService.update(
      { ...updateTeamDto, id: teamId },
      data.payload.id,
    );
  }

  @Delete('/:teamId')
  async delete(
    @CurrentUser() data: IResponse<User>,
    @Param('teamId') teamId: string,
  ): IPromiseResponse<boolean> {
    return this.teamService.delete(teamId, data.payload.id);
  }
}
