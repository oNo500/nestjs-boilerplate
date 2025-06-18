import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
