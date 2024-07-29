import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { REQUEST_USER_KEY } from '../../domain/auth_type.enum';
import { User } from '../../domain/user.domain';

export const CurrentUser = createParamDecorator(
  (field: keyof User, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: User | undefined = request[REQUEST_USER_KEY];
    return field ? user?.[field] : user;
  },
);
