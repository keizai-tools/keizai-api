import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  IPromiseResponse,
  IResponse,
} from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';
import { CurrentUser } from '@/modules/user/application/decorator/current_user.decorator';
import { User } from '@/modules/user/domain/user.domain';

import { CreateEnvironmentDto } from '../application/dto/create-environment.dto';
import { EnvironmentResponseDto } from '../application/dto/environment-response.dto';
import { UpdateEnvironmentDto } from '../application/dto/update-environment.dto';
import { EnvironmentService } from '../application/service/environment.service';

@Auth(AuthType.Bearer)
@ApiTags('Environment')
@Controller('environment')
export class EnvironmentUserController {
  constructor(private readonly environmentService: EnvironmentService) {}

  @Post('')
  async create(
    @CurrentUser() data: IResponse<User>,
    @Body() createEnvironmentDto: CreateEnvironmentDto,
  ): IPromiseResponse<EnvironmentResponseDto> {
    return this.environmentService.createByUser(
      createEnvironmentDto,
      data.payload.id,
    );
  }

  @Get('/:id')
  findOne(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<EnvironmentResponseDto> {
    return this.environmentService.findOneByEnvAndUserId(id, data.payload.id);
  }

  @Patch()
  update(
    @CurrentUser() data: IResponse<User>,
    @Body() updateEnvironmentDto: UpdateEnvironmentDto,
  ): IPromiseResponse<EnvironmentResponseDto> {
    return this.environmentService.updateByUser(
      updateEnvironmentDto,
      data.payload.id,
    );
  }

  @Delete('/:id')
  delete(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<boolean> {
    return this.environmentService.deleteByUser(id, data.payload.id);
  }

  @Delete('/')
  deleteByName(
    @Query('name') name: string,
    @Query('collectionId') collectionId: string,
  ): IPromiseResponse<boolean> {
    return this.environmentService.deleteByName(name, collectionId);
  }
}
