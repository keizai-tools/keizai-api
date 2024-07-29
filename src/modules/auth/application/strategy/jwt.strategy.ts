import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';

import { ENVIRONMENT } from '@/common/base/enum/common.enum';
import { IAccessTokenPayload } from '@/common/cognito/application/interface/access_token_payload.interface';
import {
  IPromiseResponse,
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';
import {
  IUserService,
  USER_SERVICE,
} from '@/modules/user/application/interfaces/user.service.interfaces';
import { ServiceMessage } from '@/modules/user/application/message/user.message';
import { User } from '@/modules/user/domain/user.domain';
import { JWT_AUTOMATED_TESTS_SECRET } from '@/test/test.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    @Inject(USER_SERVICE)
    private readonly userRepository: IUserService,
  ) {
    super(JwtStrategy.getStrategyOptions());
    this.responseService.setContext(JwtStrategy.name);
  }

  async validate(payload: IAccessTokenPayload): IPromiseResponse<User> {
    try {
      const currentUser = await this.userRepository.getUserByExternalId(
        payload.sub,
        false,
      );

      if (!currentUser.payload) {
        throw new ForbiddenException(ServiceMessage.NOT_FOUND);
      }

      return currentUser;
    } catch (error) {
      this.handleError(error);
    }
  }

  private static getStrategyOptions(): StrategyOptions {
    return process.env.NODE_ENV === ENVIRONMENT.AUTOMATED_TEST
      ? {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: true,
          secretOrKey: JWT_AUTOMATED_TESTS_SECRET,
        }
      : {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: false,
          audience: process.env.AWS_COGNITO_COGNITO_CLIENT_ID,
          issuer: process.env.AWS_COGNITO_AUTHORITY,
          algorithms: ['RS256'],
          secretOrKeyProvider: passportJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: `${process.env.AWS_COGNITO_AUTHORITY}/.well-known/jwks.json`,
          }),
        };
  }

  private handleError(error: Error): void {
    this.responseService.errorHandler({
      type: 'INTERNAL_SERVER_ERROR',
      error,
    });
  }
}
