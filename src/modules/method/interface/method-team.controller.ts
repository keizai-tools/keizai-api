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

import { IPromiseResponse } from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';
import { AuthTeamGuard } from '@/modules/authorization/guard/auth-team.guard';

import { CreateMethodDto } from '../application/dto/create-method.dto';
import { MethodResponseDto } from '../application/dto/method-response.dto';
import { UpdateMethodDto } from '../application/dto/update-method.dto';
import { MethodService } from '../application/service/method.service';

@Auth(AuthType.Bearer)
@ApiTags('Method Team')
@UseGuards(AuthTeamGuard)
@Controller('/team/:teamId/method')
export class MethodTeamController {
  constructor(private readonly methodService: MethodService) {}

  @Post('')
  async create(
    @Param('teamId') teamId: string,
    @Body() createMethodDto: CreateMethodDto,
  ): IPromiseResponse<MethodResponseDto> {
    return this.methodService.createByTeam(createMethodDto, teamId);
  }

  @Get('/:id')
  findOne(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<MethodResponseDto> {
    return this.methodService.findOneByMethodAndTeamId(id, teamId);
  }

  @Patch('')
  update(
    @Param('teamId') teamId: string,
    @Body() updateMethodDto: UpdateMethodDto,
  ): IPromiseResponse<MethodResponseDto> {
    return this.methodService.updateByTeam(updateMethodDto, teamId);
  }

  @Delete('/:id')
  delete(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<boolean> {
    return this.methodService.deleteByTeam(id, teamId);
  }
}
