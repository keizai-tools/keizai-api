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

import { CreateInvocationDto } from '../application/dto/create-invocation.dto';
import { UpdateInvocationDto } from '../application/dto/update-invocation.dto';
import { InvocationService } from '../application/service/invocation.service';

@Controller('invocation')
export class InvocationController {
  constructor(private readonly invocationService: InvocationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  async create(
    @Body() createFolderDto: CreateInvocationDto,
    @AuthUser() user: IUserResponse,
  ) {
    return this.invocationService.create(createFolderDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  findAll(@AuthUser() user: IUserResponse) {
    return this.invocationService.findAll(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  findOne(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.invocationService.findOneByIds(user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  update(
    @Body() updateFoldertDto: UpdateInvocationDto,
    @AuthUser() user: IUserResponse,
  ) {
    return this.invocationService.update(updateFoldertDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  delete(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.invocationService.delete(user, id);
  }
}
