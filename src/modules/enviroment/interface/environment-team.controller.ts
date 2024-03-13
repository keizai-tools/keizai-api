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

import { AdminRoleGuard } from '@/modules/auth/infrastructure/guard/admin-role.guard';
import { AuthTeamGuard } from '@/modules/auth/infrastructure/guard/auth-team.guard';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';

import { CreateEnviromentDto } from '../application/dto/create-enviroment.dto';
import { UpdateEnviromentDto } from '../application/dto/update-enviroment.dto';
import { EnviromentService } from '../application/service/enviroment.service';

@Controller('/team/:teamId/environment')
@UseGuards(JwtAuthGuard, AuthTeamGuard)
export class EnviromentTeamController {
  constructor(private readonly enviromentService: EnviromentService) {}

  @UseGuards(AdminRoleGuard)
  @Post('/')
  async create(
    @Param('teamId') teamId: string,
    @Body() createEnviromentDto: CreateEnviromentDto,
  ) {
    return this.enviromentService.createByTeam(createEnviromentDto, teamId);
  }

  @Get('/:id')
  findOne(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.enviromentService.findOneByEnvAndTeamId(id, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Patch('')
  update(
    @Param('teamId') teamId: string,
    @Body() updateEnviromentDto: UpdateEnviromentDto,
  ) {
    return this.enviromentService.updateByTeam(updateEnviromentDto, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Delete('/:id')
  delete(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.enviromentService.deleteByTeam(id, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Delete('/')
  deleteByName(
    @Query('name') name: string,
    @Query('collectionId') collectionId: string,
  ) {
    return this.enviromentService.deleteByName(name, collectionId);
  }
}
