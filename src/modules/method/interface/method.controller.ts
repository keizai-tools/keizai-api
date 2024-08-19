import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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

import { CreateMethodDto } from '../application/dto/create-method.dto';
import { MethodResponseDto } from '../application/dto/method-response.dto';
import { UpdateMethodDto } from '../application/dto/update-method.dto';
import { MethodService } from '../application/service/method.service';

@Auth(AuthType.Bearer)
@ApiTags('Method')
@Controller('method')
export class MethodUserController {
  constructor(private readonly methodService: MethodService) {}

  @Post('')
  async create(
    @CurrentUser() data: IResponse<User>,
    @Body() createMethodDto: CreateMethodDto,
  ): IPromiseResponse<MethodResponseDto> {
    return this.methodService.createByUser(createMethodDto, data.payload.id);
  }

  @Get('/:id')
  findOne(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<MethodResponseDto> {
    return this.methodService.findOneByMethodAndUserId(id, data.payload.id);
  }

  @Patch()
  update(
    @CurrentUser() data: IResponse<User>,
    @Body() updateMethodDto: UpdateMethodDto,
  ): IPromiseResponse<MethodResponseDto> {
    return this.methodService.updateByUser(updateMethodDto, data.payload.id);
  }

  @Delete('/:id')
  delete(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<boolean> {
    return this.methodService.deleteByUser(id, data.payload.id);
  }
}
