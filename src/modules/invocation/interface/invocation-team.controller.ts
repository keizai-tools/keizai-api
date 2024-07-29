import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ResilienceInterceptor, RetryStrategy } from 'nestjs-resilience';

import { IPromiseResponse } from '@/common/response_service/interface/response.interface';
import type {
  ContractErrorResponse,
  RunInvocationResponse,
} from '@/common/stellar_service/application/interface/soroban';
import { Method } from '@/modules/method/domain/method.domain';

import { CreateInvocationDto } from '../application/dto/create-invocation.dto';
import { InvocationResponseDto } from '../application/dto/invocation-response.dto';
import { UpdateInvocationDto } from '../application/dto/update-invocation.dto';
import { InvocationService } from '../application/service/invocation.service';

@Controller('/team/:teamId/invocation')
export class InvocationTeamController {
  constructor(private readonly invocationService: InvocationService) {}

  @Post('')
  async create(
    @Param('teamId') teamId: string,
    @Body() createInvocationDto: CreateInvocationDto,
  ): IPromiseResponse<InvocationResponseDto> {
    return this.invocationService.createByTeam(createInvocationDto, teamId);
  }

  @Get('/:id')
  findOne(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<InvocationResponseDto> {
    return this.invocationService.findOneByInvocationAndTeamIdToDto(id, teamId);
  }

  @Get('/:id/run')
  runInvocation(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<RunInvocationResponse | ContractErrorResponse> {
    return this.invocationService.runInvocationByTeam(id, teamId);
  }

  @Get('/:id/methods')
  findAllMethods(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<Method[]> {
    return this.invocationService.findAllMethodsByTeam(id, teamId);
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
    @Param('teamId') teamId: string,
  ): IPromiseResponse<InvocationResponseDto> {
    return this.invocationService.updateByTeam(updateInvocationDto, teamId);
  }

  @Delete('/:id')
  delete(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<boolean> {
    return this.invocationService.deleteByTeam(id, teamId);
  }
}
