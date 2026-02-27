import {
  Injectable,
} from '@nestjs/common'
import { ClsService } from 'nestjs-cls'
import { tap } from 'rxjs/operators'

import type {
  NestInterceptor,
  ExecutionContext,
  CallHandler } from '@nestjs/common'
import type { Response } from 'express'
import type { Observable } from 'rxjs'

/**
 * Request context interceptor
 *
 * Features:
 * 1. Adds the Request ID to the X-Request-Id response header
 * 2. Provides a unique identifier for each request to aid log tracing and debugging
 *
 * Use cases:
 * - Distributed system tracing
 * - Log correlation
 * - Debugging
 */
@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp()
    const response = httpContext.getResponse<Response>()

    // Retrieve the Request ID for the current request
    const requestId = this.cls.getId()

    // Add the Request ID to the response header
    if (requestId) {
      response.setHeader('X-Request-Id', requestId)
    }

    return next.handle().pipe(
      tap(() => {
        // Post-request processing (if needed)
      }),
    )
  }
}
