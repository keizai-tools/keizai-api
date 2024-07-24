import { SetMetadata } from '@nestjs/common';

import { AuthType } from '@/common/cognito/domain/auth_type.enum';

export const AUTH_TYPE_KEY = 'AUTH_TYPE_KEY';

export function Auth(...authTypes: AuthType[]) {
  return SetMetadata(AUTH_TYPE_KEY, authTypes);
}
