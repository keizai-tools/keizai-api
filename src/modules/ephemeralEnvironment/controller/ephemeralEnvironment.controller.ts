import {
  Controller,
  Delete,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  IPromiseResponse,
  IResponse,
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';
import { CurrentUser } from '@/modules/user/application/decorator/current_user.decorator';
import { User } from '@/modules/user/domain/user.domain';

import { WhiteListGuard } from '../application/guard/whiteList.guard';
import {
  EPHEMERAL_ENVIRONMENT_SERVICE,
  ITaskInfo,
} from '../application/interface/ephemeralEnvironment.interface';
import { EphemeralEnvironmentService } from '../application/service/ephemeralEnvironment.service';

@Auth(AuthType.Bearer)
@UseGuards(WhiteListGuard)
@Controller('ephemeral-environment')
export class EphemeralEnvironmentController {
  constructor(
    @Inject(EPHEMERAL_ENVIRONMENT_SERVICE)
    private readonly ephemeralEnvironmentService: EphemeralEnvironmentService,
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
  ) {
    this.responseService.setContext(EphemeralEnvironmentService.name);
  }

  @Post('start')
  async handleStartFargate(
    @CurrentUser() data: IResponse<User>,
    @Query('interval') interval: number,
  ): IPromiseResponse<ITaskInfo> {
    return await this.ephemeralEnvironmentService.startTask(
      data.payload.id,
      interval,
    );
  }

  @Delete('stop')
  async handleStopFargate(
    @CurrentUser() user: IResponse<User>,
  ): IPromiseResponse<{
    taskArn: string;
    status: string;
  }> {
    return await this.ephemeralEnvironmentService.stopTask(user.payload.id);

  }

  @Get('status')
  async handleGetTaskStatus(
    @CurrentUser() user: IResponse<User>,
  ): IPromiseResponse<{ status: string; taskArn: string; publicIp: string }> {
    return await this.ephemeralEnvironmentService.getTaskStatus(
      user.payload.id,
    );

  }
}
