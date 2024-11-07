import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

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
    const user = request.user as User;
    return user && this.whitelist.includes(user.email);
  }
}
