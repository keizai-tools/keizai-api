import {
  ConsoleLogger,
  HttpException,
  HttpStatus,
  Injectable,
  Scope,
} from '@nestjs/common';

import { ENVIRONMENT } from '@/common/base/enum/common.enum';

import {
  IResponseService,
  TCreateResponse,
} from '../interface/response.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class ResponseService extends ConsoleLogger implements IResponseService {
  mark = 'Handled by ResponseService.errorHandler';
  status =
    process.env.NODE_ENV !== ENVIRONMENT.PRODUCTION &&
    process.env.NODE_ENV !== ENVIRONMENT.STAGING;

  createResponse: TCreateResponse = ({ type = 'OK', message, payload }) => {
    if (message && this.status) {
      this.verbose(`Message: ${message}`, this.context);
    }

    if (message && message.toString() === '[object Object]') {
      message = JSON.stringify(message, null, 2);
    }

    return {
      success: HttpStatus[type]
        ? HttpStatus[type] >= 0 && HttpStatus[type] < 400
        : true,
      statusCode: HttpStatus[type] ? HttpStatus[type] : 200,
      message: message || 'Success',
      payload,
      type,
    };
  };

  errorHandler = ({
    type = 'INTERNAL_SERVER_ERROR',
    error,
  }: {
    type?: keyof typeof HttpStatus;
    error?: Error | Error[];
  }): void => {
    if (error instanceof HttpException) {
      if (JSON.stringify(error).includes(this.mark)) {
        throw error;
      }

      this.handleError({ error });

      throw this.createHttpException({
        code: error.getStatus(),
        error,
      });
    }

    this.handleError({ error });

    throw this.createHttpException({
      code: HttpStatus[type],
      error,
    });
  };

  verbose(message: any, context?: string) {
    if (this.status) {
      this.logMessage('verbose', message, context);
    }
  }

  error(message: any, stackOrContext?: string) {
    this.logMessage('error', message, stackOrContext);
  }

  private logMessage(
    level: 'verbose' | 'error',
    message: any,
    context?: string,
  ) {
    if (message && message.toString() === '[object Object]') {
      message = JSON.stringify(message, null, 2);
    }
    super[level](message, context || this.context);
  }

  private handleError({
    error,
    description,
  }: {
    error: Error | Error[];
    description?: string;
  }): void {
    if (description) this.error(`Message: ${description}`, this.context);
    if (Array.isArray(error)) {
      error.forEach((err) => {
        if (err && err.toString().length > 0)
          this.error(err.toString(), this.context);
      });
    } else if (error && error.toString().length > 0) {
      this.error(JSON.stringify(error.message, null, 2), this.context);
    }
  }

  private createHttpException({
    error,
    code,
  }: {
    code: number;
    error: Error | Error[];
  }): HttpException {
    const newError = Array.isArray(error)
      ? new Error(error.map((e) => e?.message).join(', '))
      : error;

    const message = Array.isArray(error)
      ? error.map((e) => e?.message)
      : error?.message || '';

    return new HttpException(message, code, {
      cause: newError,
      description: this.mark,
    });
  }
}
