import {
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common'
import { throwError, TimeoutError } from 'rxjs'
import { catchError, timeout } from 'rxjs/operators'

import type {
  NestInterceptor,
  ExecutionContext,
  CallHandler } from '@nestjs/common'
import type { Observable } from 'rxjs'

/**
 * Timeout interceptor - sets request timeout (default: 30s)
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly timeoutMs: number

  constructor(timeoutMs: number = 30_000) {
    this.timeoutMs = timeoutMs
  }

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((error: unknown) => {
        if (error instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                `Request timeout after ${this.timeoutMs}ms`,
              ),
          )
        }
        return throwError(() => error)
      }),
    )
  }
}
