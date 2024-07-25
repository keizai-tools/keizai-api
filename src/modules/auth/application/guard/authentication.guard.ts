import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';

import { AuthType } from '../../domain/auth_type.enum';
import { AUTH_TYPE_KEY } from '../decorator/auth.decorator';
import { AuthTypeGuardMap } from '../interface/authentication_guard.interface';
import { AccessTokenGuard } from './access_token.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType: AuthType = AuthType.Bearer;

  private readonly authTypeGuardMap: AuthTypeGuardMap = {
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.None]: { canActivate: async () => true },
  };

  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly reflector: Reflector,
  ) {
    this.responseService.setContext(AuthenticationGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const authTypes = this.getAuthTypes(context) ?? [
        AuthenticationGuard.defaultAuthType,
      ];

      const guards = authTypes
        .map((type) => this.authTypeGuardMap[type])
        .flat();

      let error = new UnauthorizedException();

      for (const guard of guards) {
        const canActivate = await Promise.resolve(
          guard.canActivate(context),
        ).catch((err) => {
          error = err;
        });

        if (canActivate) {
          return true;
        }
      }

      throw error;
    } catch (error) {
      this.handleError(error);
    }
  }

  private getAuthTypes(context: ExecutionContext): AuthType[] {
    return this.reflector.getAllAndOverride<AuthType[]>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private handleError(error: Error): void {
    this.responseService.errorHandler({
      type: 'INTERNAL_SERVER_ERROR',
      error,
    });
  }
}
