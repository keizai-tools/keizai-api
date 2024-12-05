import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import type { IResponse } from '@/common/response_service/interface/response.interface';
import { REQUEST_USER_KEY } from '@/modules/auth/domain/auth_type.enum';
import { User } from '@/modules/user/domain/user.domain';

@Injectable()
export class WhiteListGuard implements CanActivate {
  private readonly whitelist: string[];

  constructor() {
    const whitelistEnv = process.env.WHITELIST_EMAILS || '';
    this.whitelist = whitelistEnv.split(',').map((email) => email.trim());
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request[REQUEST_USER_KEY] as IResponse<User>;
    return user && this.whitelist.includes(user.payload.email);
  }
}
