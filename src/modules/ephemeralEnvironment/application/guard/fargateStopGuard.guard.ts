import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';

import { IResponse } from '@/common/response_service/interface/response.interface';
import { REQUEST_USER_KEY } from '@/modules/auth/domain/auth_type.enum';
import {
  IUserService,
  USER_SERVICE,
} from '@/modules/user/application/interfaces/user.service.interfaces';
import { User } from '@/modules/user/domain/user.domain';

import {
  EPHEMERAL_ENVIRONMENT_SERVICE,
  IEphemeralEnvironmentService,
} from '../interface/ephemeralEnvironment.interface';

@Injectable()
export class FargateStopGuard implements CanActivate {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
    @Inject(EPHEMERAL_ENVIRONMENT_SERVICE)
    private readonly ephemeralEnvironmentService: IEphemeralEnvironmentService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request[REQUEST_USER_KEY] as IResponse<User>;

    if (!user) {
      return false;
    }

    const taskStatusResponse =
      await this.ephemeralEnvironmentService.getTaskStatus(user.payload.id);
    const taskInfo = taskStatusResponse.payload;

    const currentTime = new Date();
    const elapsedTime =
      (currentTime.getTime() - new Date(taskInfo.taskStartedAt).getTime()) /
      60000;
    const remainingTime = taskInfo.executionInterval - elapsedTime;

    const costPerMinuteResponse = this.userService.getFargateCostPerMinute();
    const remainingBalance = remainingTime * costPerMinuteResponse;

    try {
      await this.userService.updateUserBalance(
        user.payload.id,
        remainingBalance,
        true,
      );
      return true;
    } catch (error) {
      return false;
    }
  }
}
