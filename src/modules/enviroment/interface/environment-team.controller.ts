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

import { CreateEnviromentDto } from '../application/dto/create-enviroment.dto';
import { EnviromentResponseDto } from '../application/dto/enviroment-response.dto';
import { UpdateEnviromentDto } from '../application/dto/update-enviroment.dto';
import { EnviromentService } from '../application/service/enviroment.service';

@Auth(AuthType.Bearer)
@ApiTags('Environment Team')
@UseGuards(AuthTeamGuard)
@Controller('/team/:teamId/environment')
export class EnviromentTeamController {
  constructor(private readonly enviromentService: EnviromentService) {}

  @UseGuards(AdminRoleGuard)
  @Post('/')
  async create(
    @Param('teamId') teamId: string,
    @Body() createEnviromentDto: CreateEnviromentDto,
  ): IPromiseResponse<EnviromentResponseDto> {
    return this.enviromentService.createByTeam(createEnviromentDto, teamId);
  }

  @Get('/:id')
  findOne(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<EnviromentResponseDto> {
    return this.enviromentService.findOneByEnvAndTeamId(id, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Patch('')
  update(
    @Param('teamId') teamId: string,
    @Body() updateEnviromentDto: UpdateEnviromentDto,
  ): IPromiseResponse<EnviromentResponseDto> {
    return this.enviromentService.updateByTeam(updateEnviromentDto, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Delete('/:id')
  delete(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<boolean> {
    return this.enviromentService.deleteByTeam(id, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Delete('/')
  deleteByName(
    @Query('name') name: string,
    @Query('collectionId') collectionId: string,
  ): IPromiseResponse<boolean> {
    return this.enviromentService.deleteByName(name, collectionId);
  }
}
