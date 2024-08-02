import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { ENVIRONMENT } from '@/common/base/enum/common.enum';

import { generateErrorMessages } from '../utils/utils';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const loggedMessages = new Set<string>();

    if (
      (process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT ||
        process.env.NODE_ENV === ENVIRONMENT.AUTOMATED_TEST) &&
      exception instanceof Error &&
      (Array.isArray(exception.message) ||
        typeof exception.message === 'string')
    ) {
      const logMessage = (message: string) => {
        if (
          ![...loggedMessages].some(
            (existingMessage) =>
              existingMessage.includes(message) ||
              message.includes(existingMessage),
          )
        ) {
          this.logger.error(message);
          loggedMessages.add(message);
        }
      };

      logMessage(exception.message);

      if (exception instanceof HttpException) {
        const responseException = exception.getResponse();
        if (typeof responseException === 'object') {
          Object.entries(responseException).forEach(([key, value]) => {
            logMessage(`[${key}]: ${value}`);
          });
        }
      }
    }

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
