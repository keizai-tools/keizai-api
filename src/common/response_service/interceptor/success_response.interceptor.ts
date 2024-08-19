import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IResponse } from '../interface/response.interface';

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
  intercept(
    executionContext: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((data: IResponse<unknown>) => {
        const context = executionContext.switchToHttp();
        const response = context.getResponse<Response>();
        const request = context.getRequest();
        if (data?.statusCode) {
          response.status(data.statusCode);
        }

        const cleanedData = this.removeType(data);

        const transformedData = this.transformBigInt(cleanedData);

        return {
          ...transformedData,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }

  private transformBigInt(object: unknown) {
    return JSON.parse(
      JSON.stringify(object, (_key, value) =>
        typeof value === 'bigint' ? { $bigint: value.toString() } : value,
      ),
    );
  }

  private removeType(object: unknown): unknown {
    if (Array.isArray(object)) {
      return object.map((item) => this.removeType(item));
    } else if (object !== null && typeof object === 'object') {
      return Object.keys(object).reduce((acc, key) => {
        if (key !== 'type') acc[key] = this.removeType(object[key]);
        return acc;
      }, {});
    }
    return object;
  }
}
