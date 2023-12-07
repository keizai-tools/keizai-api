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

import { CreateEnvironmentDto } from '../application/dto/create-environment.dto';
import { UpdateEnvironmentDto } from '../application/dto/update-environment.dto';
import { EnvironmentService } from '../application/service/environment.service';

@Controller('environment')
export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  async create(
    @Body() createEnvironmentDto: CreateEnvironmentDto,
    @AuthUser() user: IUserResponse,
  ) {
    return this.environmentService.create(createEnvironmentDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  findAll(@AuthUser() user: IUserResponse) {
    return this.environmentService.findAll(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  findOne(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.environmentService.findOneByIds(user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  update(
    @Body() updateEnvironmentDto: UpdateEnvironmentDto,
    @AuthUser() user: IUserResponse,
  ) {
    return this.environmentService.update(updateEnvironmentDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  delete(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.environmentService.delete(user, id);
  }
}
