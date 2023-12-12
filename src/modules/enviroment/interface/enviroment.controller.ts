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

import {
  AuthUser,
  IUserResponse,
} from '@/modules/auth/infrastructure/decorators/auth.decorators';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';

import { CreateEnviromentDto } from '../application/dto/create-enviroment.dto';
import { UpdateEnviromentDto } from '../application/dto/update-enviroment.dto';
import { EnviromentService } from '../application/service/enviroment.service';

@Controller('environment')
export class EnviromentController {
  constructor(private readonly enviromentService: EnviromentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  async create(
    @Body() createEnviromentDto: CreateEnviromentDto,
    @AuthUser() user: IUserResponse,
  ) {
    return this.enviromentService.create(createEnviromentDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  findAll(@AuthUser() user: IUserResponse) {
    return this.enviromentService.findAll(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  findOne(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.enviromentService.findOneByIds(user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  update(
    @Body() updateEnviromentDto: UpdateEnviromentDto,
    @AuthUser() user: IUserResponse,
  ) {
    return this.enviromentService.update(updateEnviromentDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  delete(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.enviromentService.delete(user, id);
  }
}
