import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IPromiseResponse } from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';
import { AdminRoleGuard } from '@/modules/authorization/infraestructure/policy/guard/admin-role.guard';
import { AuthTeamGuard } from '@/modules/authorization/infraestructure/policy/guard/auth-team.guard';

import { CreateEnvironmentDto } from '../application/dto/create-environment.dto';
import { EnvironmentResponseDto } from '../application/dto/environment-response.dto';
import { UpdateEnvironmentDto } from '../application/dto/update-environment.dto';
import { EnvironmentService } from '../application/service/environment.service';

@Auth(AuthType.Bearer)
@ApiTags('Environment Team')
@UseGuards(AuthTeamGuard)
@Controller('/team/:teamId/environment')
export class EnvironmentTeamController {
  constructor(private readonly environmentService: EnvironmentService) {}

  @UseGuards(AdminRoleGuard)
  @Post('/')
  async create(
    @Param('teamId') teamId: string,
    @Body() createEnvironmentDto: CreateEnvironmentDto,
  ): IPromiseResponse<EnvironmentResponseDto> {
    return this.environmentService.createByTeam(createEnvironmentDto, teamId);
  }

  @Get('/:id')
  findOne(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<EnvironmentResponseDto> {
    return this.environmentService.findOneByEnvAndTeamId(id, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Patch('')
  update(
    @Param('teamId') teamId: string,
    @Body() updateEnvironmentDto: UpdateEnvironmentDto,
  ): IPromiseResponse<EnvironmentResponseDto> {
    return this.environmentService.updateByTeam(updateEnvironmentDto, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Delete('/:id')
  delete(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<boolean> {
    return this.environmentService.deleteByTeam(id, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Delete('/')
  deleteByName(
    @Query('name') name: string,
    @Query('collectionId') collectionId: string,
  ): IPromiseResponse<boolean> {
    return this.environmentService.deleteByName(name, collectionId);
  }
}
