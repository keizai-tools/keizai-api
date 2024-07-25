import { IAccessTokenPayload } from '@/common/cognito/application/interface/access_token_payload.interface';
import { IPromiseResponse } from '@/common/response_service/interface/response.interface';
import { User } from '@/modules/user/domain/user.domain';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface JwtResponse {
  idUser: string;
  email: string;
}

export interface IJwtStrategy {
  validate(payload: IAccessTokenPayload): IPromiseResponse<User>;
}

export const JWT_STRATEGY = 'JWT_STRATEGY';
