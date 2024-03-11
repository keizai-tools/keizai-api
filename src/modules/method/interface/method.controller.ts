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
@UseGuards(JwtAuthGuard)
export class MethodUserController {
  constructor(private readonly methodService: MethodService) {}

  @Post('')
  async create(
    @AuthUser() user: IUserResponse,
    @Body() createMethodDto: CreateMethodDto,
  ) {
    return this.methodService.createByUser(createMethodDto, user.id);
  }

  @Get('/:id')
  findOne(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.methodService.findOneByMethodAndUserId(id, user.id);
  }

  @Patch()
  update(
    @AuthUser() user: IUserResponse,
    @Body() updateMethodDto: UpdateMethodDto,
  ) {
    return this.methodService.updateByUser(updateMethodDto, user.id);
  }

  @Delete('/:id')
  delete(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.methodService.deleteByUser(id, user.id);
  }
}
