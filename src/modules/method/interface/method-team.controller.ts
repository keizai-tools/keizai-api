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

import { AuthTeamGuard } from '@/modules/auth/infrastructure/guard/auth-team.guard';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';

import { CreateMethodDto } from '../application/dto/create-method.dto';
import { UpdateMethodDto } from '../application/dto/update-method.dto';
import { MethodService } from '../application/service/method.service';

@Controller('/team/:teamId/method')
@UseGuards(JwtAuthGuard, AuthTeamGuard)
export class MethodTeamController {
  constructor(private readonly methodService: MethodService) {}

  @Post('')
  async create(
    @Param('teamId') teamId: string,
    @Body() createMethodDto: CreateMethodDto,
  ) {
    return this.methodService.createByTeam(createMethodDto, teamId);
  }

  @Get('/:id')
  findOne(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.methodService.findOneByMethodAndTeamId(id, teamId);
  }

  @Patch('')
  update(
    @Param('teamId') teamId: string,
    @Body() updateMethodDto: UpdateMethodDto,
  ) {
    return this.methodService.updateByTeam(updateMethodDto, teamId);
  }

  @Delete('/:id')
  delete(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.methodService.deleteByTeam(id, teamId);
  }
}
