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
  async create(
    @Body() createInvocationDto: CreateInvocationDto,
    @AuthUser() user: IUserResponse,
  ) {
    return this.invocationService.create(createInvocationDto, user);
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
  @Get('/:id/run')
  runInvocation(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.invocationService.runInvocation(user, id);
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
  @Patch('/:id/network')
  async updateNetwork(
    @AuthUser() user: IUserResponse,
    @Body() updateNetworkDto: UpdateInvocationDto,
  ) {
    return this.invocationService.updateNetwork(updateNetworkDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  delete(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.invocationService.delete(user, id);
  }
}
