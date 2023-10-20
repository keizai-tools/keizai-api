import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

import { COGNITO_EXCEPTION, COGNITO_RESPONSE } from './cognito.enum';
import { CognitoError } from './cognito.error';

export function exceptionsCognitoErrors(
  error: CognitoError,
  path: string,
): void {
  switch (error.code) {
    case COGNITO_EXCEPTION.CODE_DELIVERY_FAILURE:
      throw new BadRequestException(COGNITO_RESPONSE.CODE_DELIVERY_FAILURE);
    case COGNITO_EXCEPTION.INVALID_PARAMETER:
      throw new BadRequestException(COGNITO_RESPONSE.INVALID_PARAMETER);
    case COGNITO_EXCEPTION.INVALID_PASSWORD:
      throw new BadRequestException(COGNITO_RESPONSE.INVALID_PASSWORD);
    case COGNITO_EXCEPTION.INTERNAL_ERROR:
      throw new InternalServerErrorException(COGNITO_RESPONSE.INTERNAL_ERROR);
    case COGNITO_EXCEPTION.NOT_AUTHORIZED:
      throw new UnauthorizedException(COGNITO_RESPONSE.NOT_AUTHORIZED);
    case COGNITO_EXCEPTION.REQUEST_EXPIRED:
      throw new RequestTimeoutException(COGNITO_RESPONSE.REQUEST_EXPIRED);
    case COGNITO_EXCEPTION.SERVICE_UNAVAILABLE:
      throw new ServiceUnavailableException(
        COGNITO_RESPONSE.SERVICE_UNAVAILABLE,
      );
    case COGNITO_EXCEPTION.TOO_MANY_REQUEST:
      throw new BadRequestException(COGNITO_RESPONSE.TOO_MANY_REQUEST);
    case COGNITO_EXCEPTION.USERNAME_EXIST:
      throw new BadRequestException(COGNITO_RESPONSE.USERNAME_EXIST);
    case COGNITO_EXCEPTION.USER_NOT_CONFIRMED:
      throw new NotFoundException(COGNITO_RESPONSE.USER_NOT_CONFIRMED);
    default:
      if (path === 'login') {
        throw new BadRequestException(COGNITO_RESPONSE.FAILED_LOGIN);
      } else if (path === 'register') {
        throw new BadRequestException(COGNITO_RESPONSE.FAILED_REGISTER);
      }
  }
}
