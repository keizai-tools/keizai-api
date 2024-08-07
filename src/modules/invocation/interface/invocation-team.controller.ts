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

import { IPromiseResponse } from '@/common/response_service/interface/response.interface';
import {
  ContractErrorResponse,
  RunInvocationResponse,
} from '@/common/stellar_service/application/interface/soroban';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';
import { AdminRoleGuard } from '@/modules/authorization/infraestructure/policy/guard/admin-role.guard';
import { AuthTeamGuard } from '@/modules/authorization/infraestructure/policy/guard/auth-team.guard';
import { Method } from '@/modules/method/domain/method.domain';

import { CreateInvocationDto } from '../application/dto/create-invocation.dto';
import { InvocationResponseDto } from '../application/dto/invocation-response.dto';
import { UpdateInvocationDto } from '../application/dto/update-invocation.dto';
import { InvocationService } from '../application/service/invocation.service';

@Auth(AuthType.Bearer)
@UseGuards(AuthTeamGuard)
@Controller('/team/:teamId/invocation')
export class InvocationTeamController {
  constructor(private readonly invocationService: InvocationService) {}

  @Post('')
  @UseGuards(AdminRoleGuard)
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

  @Post('/:id/run')
  runInvocation(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
    @Body()
    {
      signedTransactionXDR,
    }: {
      signedTransactionXDR?: string;
    },
  ): IPromiseResponse<RunInvocationResponse | ContractErrorResponse> {
    return this.invocationService.runInvocationByTeam(
      id,
      teamId,
      signedTransactionXDR,
    );
  }

  @Get('/:id/prepare')
  prepareInvocation(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<string> {
    return this.invocationService.prepareInvocationByTeam(id, teamId);
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

  @UseGuards(AdminRoleGuard)
  @Delete('/:id')
  delete(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ): IPromiseResponse<boolean> {
    return this.invocationService.deleteByTeam(id, teamId);
  }
}
