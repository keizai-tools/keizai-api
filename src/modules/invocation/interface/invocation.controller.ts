import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ResilienceInterceptor, RetryStrategy } from 'nestjs-resilience';

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
  async create(@Body() createInvocationDto: CreateInvocationDto) {
    return this.invocationService.create(createInvocationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  findAll(@AuthUser() user: IUserResponse) {
    return this.invocationService.findAll(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.invocationService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/run')
  runInvocation(@Param('id') id: string) {
    return this.invocationService.runInvocation(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('')
  @UseInterceptors(
    ResilienceInterceptor(
      new RetryStrategy({
        maxRetries: 5,
      }),
    ),
  )
  update(
    @Body() updateInvocationDto: UpdateInvocationDto,
    @AuthUser() user: IUserResponse,
  ) {
    return this.invocationService.update(updateInvocationDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.invocationService.delete(id);
  }
}
