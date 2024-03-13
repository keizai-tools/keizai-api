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

import {
  AuthUser,
  IUserResponse,
} from '@/modules/auth/infrastructure/decorators/auth.decorators';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';

import { CreateEnviromentDto } from '../application/dto/create-enviroment.dto';
import { UpdateEnviromentDto } from '../application/dto/update-enviroment.dto';
import { EnviromentService } from '../application/service/enviroment.service';

@Controller('environment')
@UseGuards(JwtAuthGuard)
export class EnviromentUserController {
  constructor(private readonly enviromentService: EnviromentService) {}

  @Post('')
  async create(
    @AuthUser() user: IUserResponse,
    @Body() createEnviromentDto: CreateEnviromentDto,
  ) {
    return this.enviromentService.createByUser(createEnviromentDto, user.id);
  }

  @Get('/:id')
  findOne(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.enviromentService.findOneByEnvAndUserId(id, user.id);
  }

  @Patch()
  update(
    @AuthUser() user: IUserResponse,
    @Body() updateEnviromentDto: UpdateEnviromentDto,
  ) {
    return this.enviromentService.updateByUser(updateEnviromentDto, user.id);
  }

  @Delete('/:id')
  delete(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.enviromentService.deleteByUser(id, user.id);
  }

  @Delete('/')
  deleteByName(
    @Query('name') name: string,
    @Query('collectionId') collectionId: string,
  ) {
    return this.enviromentService.deleteByName(name, collectionId);
  }
}
