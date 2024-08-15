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
import { ApiTags } from '@nestjs/swagger';

import {
  IPromiseResponse,
  IResponse,
} from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';
import { AdminRoleGuard } from '@/modules/authorization/guard/admin-role.guard';
import { OwnerRoleGuard } from '@/modules/authorization/guard/owner-role.guard';
import { CurrentUser } from '@/modules/user/application/decorator/current_user.decorator';
import { User } from '@/modules/user/domain/user.domain';

import { CreateTeamDto } from '../application/dto/create-team.dto';
import { TeamResponseDto } from '../application/dto/response-team.dto';
import { UpdateTeamDto } from '../application/dto/update-team.dto';
import { TeamService } from '../application/service/team.service';

@Auth(AuthType.Bearer)
@ApiTags('Team')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('/')
  async findAllByUser(
    @CurrentUser() data: IResponse<User>,
  ): IPromiseResponse<TeamResponseDto[]> {
    return this.teamService.findAllByUser(data.payload.id);
  }

  @UseGuards(AdminRoleGuard)
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

  @UseGuards(AdminRoleGuard)
  @Patch('/:teamId')
  async update(
    @CurrentUser() data: IResponse<User>,
    @Body() updateTeamDto: UpdateTeamDto,
    @Param('teamId') teamId: string,
  ): IPromiseResponse<TeamResponseDto> {
    return this.teamService.update(
      { ...updateTeamDto, id: teamId },
      data.payload.id,
    );
  }

  @UseGuards(OwnerRoleGuard)
  @Delete('/:teamId')
  async delete(
    @CurrentUser() data: IResponse<User>,
    @Param('teamId') teamId: string,
  ): IPromiseResponse<boolean> {
    return this.teamService.delete(teamId, data.payload.id);
  }
}
