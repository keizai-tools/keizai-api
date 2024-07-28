import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { IPromiseResponse } from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';

import { CreateEnviromentDto } from '../application/dto/create-enviroment.dto';
import { EnviromentResponseDto } from '../application/dto/enviroment-response.dto';
import { UpdateEnviromentDto } from '../application/dto/update-enviroment.dto';
import {
  ENVIROMENT_SERVICE,
  IEnviromentService,
} from '../application/interface/enviroment.service.interface';

@Auth(AuthType.Bearer)
@Controller('/team/:teamId/environment')
export class EnviromentTeamController {
  constructor(
    @Inject(ENVIROMENT_SERVICE)
    private readonly enviromentService: IEnviromentService,
  ) {}

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

  @Patch('')
  update(
    @Param('teamId') teamId: string,
    @Body() updateEnviromentDto: UpdateEnviromentDto,
  ): IPromiseResponse<EnviromentResponseDto> {
    return this.enviromentService.updateByTeam(updateEnviromentDto, teamId);
  }

  @Delete('/:id')
  delete(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<boolean> {
    return this.enviromentService.deleteByTeam(id, teamId);
  }

  @Delete('/')
  deleteByName(
    @Query('name') name: string,
    @Query('collectionId') collectionId: string,
  ): IPromiseResponse<boolean> {
    return this.enviromentService.deleteByName(name, collectionId);
  }
}
