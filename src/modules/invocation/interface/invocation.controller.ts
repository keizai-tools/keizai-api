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
@UseGuards(JwtAuthGuard)
export class InvocationUserController {
  constructor(private readonly invocationService: InvocationService) {}

  @Post('')
  async create(
    @AuthUser() user: IUserResponse,
    @Body() createInvocationDto: CreateInvocationDto,
  ) {
    return this.invocationService.createByUser(createInvocationDto, user.id);
  }

  @Get('/:id')
  findOne(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.invocationService.findOneByInvocationAndUserIdToDto(
      id,
      user.id,
    );
  }

  @Get('/:id/run')
  runInvocation(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.invocationService.runInvocationByUser(id, user.id);
  }

  @Get(':id/methods')
  findAllMethods(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.invocationService.findAllMethodsByUser(id, user.id);
  }

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
    return this.invocationService.updateByUser(updateInvocationDto, user.id);
  }

  @Delete('/:id')
  delete(@AuthUser() user: IUserResponse, @Param('id') id: string) {
    return this.invocationService.deleteByUser(id, user.id);
  }
}
