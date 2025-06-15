import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const request = context.switchToHttp().getRequest();
        const traceId =
          request.headers['x-request-id'] ||
          request.headers['x-correlation-id'] ||
          request.id ||
          request.url;
        return {
          success: true,
          data,
          meta: {
            traceId,
            timestamp: new Date().toISOString(),
          },
        };
      }),
    );
  }
}
