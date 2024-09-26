import { CanActivate } from '@nestjs/common';

import { AuthType } from '../../domain/auth_type.enum';

export type AuthTypeGuardMap = Record<AuthType, CanActivate | CanActivate[]>;
