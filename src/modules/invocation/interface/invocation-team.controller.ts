import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ResilienceInterceptor, RetryStrategy } from 'nestjs-resilience';

import { AdminRoleGuard } from '@/modules/auth/infrastructure/guard/admin-role.guard';
import { AuthTeamGuard } from '@/modules/auth/infrastructure/guard/auth-team.guard';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guard/policy-auth.guard';

import { CreateInvocationDto } from '../application/dto/create-invocation.dto';
import { UpdateInvocationDto } from '../application/dto/update-invocation.dto';
import { InvocationService } from '../application/service/invocation.service';

@Controller('/team/:teamId/invocation')
@UseGuards(JwtAuthGuard, AuthTeamGuard)
export class InvocationTeamController {
  constructor(private readonly invocationService: InvocationService) {}

  @UseGuards(AdminRoleGuard)
  @Post('')
  async create(
    @Param('teamId') teamId: string,
    @Body() createInvocationDto: CreateInvocationDto,
  ) {
    return this.invocationService.createByTeam(createInvocationDto, teamId);
  }

  @Get('/:id')
  findOne(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.invocationService.findOneByInvocationAndTeamIdToDto(id, teamId);
  }

  @Get('/:id/prepare')
  prepareInvocation(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.invocationService.prepareInvocationByTeam(id, teamId);
  }

  @Post('/:id/run')
  @HttpCode(200)
  runInvocation(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
    @Body()
    {
      signedTransactionXDR,
    }: {
      signedTransactionXDR?: string;
    },
  ) {
    return this.invocationService.runInvocationByTeam(
      id,
      teamId,
      signedTransactionXDR,
    );
  }

  @Get('/:id/methods')
  findAllMethods(@Param('teamId') teamId: string, @Param('id') id: string) {
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
  ) {
    return this.invocationService.updateByTeam(updateInvocationDto, teamId);
  }

  @UseGuards(AdminRoleGuard)
  @Delete('/:id')
  delete(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.invocationService.deleteByTeam(id, teamId);
  }
}
