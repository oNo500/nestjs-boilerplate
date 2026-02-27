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
 * W3C Trace Context interceptor
 *
 * Spec: https://www.w3.org/TR/trace-context/
 *
 * Features:
 * - Adds the Trace ID to the Trace-Id response header
 * - Supports the W3C Trace Context standard
 * - Used with distributed tracing systems (e.g. OpenTelemetry)
 *
 * W3C Trace Context format:
 * traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
 *              |  |                                |                |
 *              |  +- trace-id (32 hex chars)       |                +- trace-flags
 *              |                                   +- parent-id (16 hex chars)
 *              +- version
 *
 * Use cases:
 * - Full call chain tracing in distributed systems
 * - Integration with APM tools (e.g. Jaeger, Zipkin)
 * - Performance analysis and troubleshooting
 *
 * @example
 * // Client sends request
 * GET /api/orders
 * traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
 *
 * // Server response
 * HTTP/1.1 200 OK
 * Trace-Id: 4bf92f3577b34da6a3ce929d0e0e4736  // <- echo back Trace ID
 *
 * // Downstream service call (generates a new parent-id)
 * GET /api/inventory
 * traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-{new_parent_id}-01
 */
@Injectable()
export class TraceContextInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp()
    const response = httpContext.getResponse<Response>()

    // Retrieve the Trace ID (already parsed and stored in ClsModule)
    const traceId = this.cls.get<string>('traceId')

    // Add to response header
    if (traceId) {
      response.setHeader('Trace-Id', traceId)
    }

    return next.handle().pipe(
      tap(() => {
        // Post-request processing (if needed)
      }),
    )
  }
}
