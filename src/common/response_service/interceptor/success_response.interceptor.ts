import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map(
        (data: {
          statusCode?: number;
          message: string;
          data?: unknown;
          errors?: unknown;
        }) => {
          const ctx = context.switchToHttp();
          const response = ctx.getResponse<Response>();
          const request = ctx.getRequest();

          if (data.statusCode) {
            response.status(data.statusCode);
          }

          const transformedData = this.transformBigInt(data);

          return {
            ...transformedData,
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        },
      ),
    );
  }

  private transformBigInt(obj: unknown) {
    return JSON.parse(
      JSON.stringify(obj, (_key, value) =>
        typeof value === 'bigint' ? { $bigint: value.toString() } : value,
      ),
    );
  }
}
