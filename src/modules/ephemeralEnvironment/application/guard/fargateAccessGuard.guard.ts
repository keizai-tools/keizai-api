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

@Injectable()
export class FargateAccessGuard implements CanActivate {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request[REQUEST_USER_KEY] as IResponse<User>;
    const interval = request.query.interval;

    if (!user) {
      return false;
    }

    const userBalanceResponse = await this.userService.getUserByEmail(
      user.payload.email,
    );

    const userBalance = userBalanceResponse.payload.balance;

    const costPerMinuteResponse = this.userService.getFargateCostPerMinute();

    const requiredBalance = interval * costPerMinuteResponse;

    if (userBalance >= requiredBalance) {
      try {
        await this.userService.updateUserBalance(user.payload.id, interval);
        return true;
      } catch (error) {
        return false;
      }
    }

    return false;
  }
}
