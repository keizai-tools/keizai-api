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

import { CreateMethodDto } from '../application/dto/create-method.dto';
import { UpdateMethodDto } from '../application/dto/update-method.dto';
import { MethodService } from '../application/service/method.service';

@Controller('method')
export class MethodController {
  constructor(private readonly methodService: MethodService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  async create(@Body() createMethodDto: CreateMethodDto) {
    return this.methodService.create(createMethodDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  findAll(@AuthUser() user: IUserResponse) {
    return this.methodService.findAll(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.methodService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  update(@Body() updateMethodDto: UpdateMethodDto) {
    return this.methodService.update(updateMethodDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.methodService.delete(id);
  }
}
