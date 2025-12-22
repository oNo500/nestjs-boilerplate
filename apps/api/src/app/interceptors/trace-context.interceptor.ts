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
 * W3C Trace Context interceptor - adds Trace-Id to response headers
 * Supports distributed tracing systems (OpenTelemetry, Jaeger, Zipkin)
 */
@Injectable()
export class TraceContextInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp()
    const response = httpContext.getResponse<Response>()

    const traceId = this.cls.get<string>('traceId')

    if (traceId) {
      response.setHeader('Trace-Id', traceId)
    }

    return next.handle().pipe(
      tap(() => {
        // Post-request handling if needed
      }),
    )
  }
}
