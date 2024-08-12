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
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: IResponse<unknown>) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();
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

  private transformBigInt(obj: unknown) {
    return JSON.parse(
      JSON.stringify(obj, (_key, value) =>
        typeof value === 'bigint' ? { $bigint: value.toString() } : value,
      ),
    );
  }

  private removeType(obj: unknown): unknown {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.removeType(item));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        if (key !== 'type') acc[key] = this.removeType(obj[key]);
        return acc;
      }, {});
    }
    return obj;
  }
}
