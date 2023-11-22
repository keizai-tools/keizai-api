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

import { CreatePreInvocationDto } from '../application/dto/create-pre-invocation.dto';
import { UpdatePreInvocationDto } from '../application/dto/update-pre-invocation.dto';
import { PreInvocationService } from '../application/service/pre-invocation.service';

@Controller('pre-invocation')
export class PreInvocationController {
  constructor(private readonly preInvocationService: PreInvocationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  async create(
    @Body() createPreInvocationDto: CreatePreInvocationDto,
    @AuthUser() user: IUserResponse,
  ) {
    return this.preInvocationService.create(createPreInvocationDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  findAll(@AuthUser() user: IUserResponse) {
    return this.preInvocationService.findAll(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  findOne(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.preInvocationService.findOneByIds(user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  update(
    @Body() updatePreInvocationDto: UpdatePreInvocationDto,
    @AuthUser() user: IUserResponse,
  ) {
    return this.preInvocationService.update(updatePreInvocationDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  delete(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.preInvocationService.delete(user, id);
  }
}
