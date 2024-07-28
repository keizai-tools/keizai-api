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

import {
  IPromiseResponse,
  IResponse,
} from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';
import { CurrentUser } from '@/modules/user/application/decorator/current_user.decorator';
import { User } from '@/modules/user/domain/user.domain';

import { CreateEnviromentDto } from '../application/dto/create-enviroment.dto';
import { EnviromentResponseDto } from '../application/dto/enviroment-response.dto';
import { UpdateEnviromentDto } from '../application/dto/update-enviroment.dto';
import {
  ENVIROMENT_SERVICE,
  IEnviromentService,
} from '../application/interface/enviroment.service.interface';

@Auth(AuthType.Bearer)
@Controller('environment')
export class EnviromentUserController {
  constructor(
    @Inject(ENVIROMENT_SERVICE)
    private readonly enviromentService: IEnviromentService,
  ) {}

  @Post('')
  async create(
    @CurrentUser() data: IResponse<User>,
    @Body() createEnviromentDto: CreateEnviromentDto,
  ): IPromiseResponse<EnviromentResponseDto> {
    return this.enviromentService.createByUser(
      createEnviromentDto,
      data.payload.id,
    );
  }

  @Get('/:id')
  findOne(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<EnviromentResponseDto> {
    return this.enviromentService.findOneByEnvAndUserId(id, data.payload.id);
  }

  @Patch()
  update(
    @CurrentUser() data: IResponse<User>,
    @Body() updateEnviromentDto: UpdateEnviromentDto,
  ): IPromiseResponse<EnviromentResponseDto> {
    return this.enviromentService.updateByUser(
      updateEnviromentDto,
      data.payload.id,
    );
  }

  @Delete('/:id')
  delete(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<boolean> {
    return this.enviromentService.deleteByUser(id, data.payload.id);
  }

  @Delete('/')
  deleteByName(
    @Query('name') name: string,
    @Query('collectionId') collectionId: string,
  ): IPromiseResponse<boolean> {
    return this.enviromentService.deleteByName(name, collectionId);
  }
}
