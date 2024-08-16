import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { generateErrorMessages } from '../utils/utils';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (exception instanceof HttpException) {
      let responseException = exception.getResponse();
      if (typeof responseException === 'string') {
        return response.status(exception.getStatus()).json({
          success: false,
          ...generateErrorMessages(exception.getStatus(), responseException),
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }

      responseException = this.removeDuplicateValues(responseException);

      return response.status(exception.getStatus()).json({
        success: false,
        ...generateErrorMessages(exception.getStatus(), responseException),
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }

  private removeDuplicateValues(responseException: unknown) {
    const valueToKeyMap = new Map();

    for (const key of Object.keys(responseException)) {
      const value = responseException[key];
      if (!valueToKeyMap.has(value)) {
        valueToKeyMap.set(value, key);
      }
    }

    const normalizedResponse = {};
    for (const [value, key] of valueToKeyMap.entries()) {
      normalizedResponse[key] = value;
    }

    return normalizedResponse;
  }
}
