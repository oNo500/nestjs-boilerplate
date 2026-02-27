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
 * Correlation ID interceptor
 *
 * Features:
 * - Adds the Correlation ID to the X-Correlation-Id response header
 * - Used for tracing business transactions across services
 * - Distinct from Request ID (which tracks a single request)
 *
 * Scope of tracking IDs:
 * - Request ID: a single request within a single service
 * - Correlation ID: a business transaction spanning multiple services
 * - Trace ID: the full call chain in a distributed system
 *
 * Use cases:
 * - Business transaction tracing in microservice architectures
 * - User session tracing (e.g. shopping cart sessions)
 * - Cross-service log correlation
 *
 * @example
 * // Client sends request
 * GET /api/orders
 * X-Correlation-ID: shop_session_abc123
 *
 * // Server response
 * HTTP/1.1 200 OK
 * X-Correlation-Id: shop_session_abc123  // <- echo back correlation ID
 * X-Request-Id: req_xyz789               // <- current request ID
 *
 * // Downstream service call propagates it
 * GET /api/inventory
 * X-Correlation-ID: shop_session_abc123  // <- propagated
 * X-Request-Id: req_downstream_001       // <- new request ID
 */
@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp()
    const response = httpContext.getResponse<Response>()

    // Retrieve the Correlation ID (already parsed and stored in ClsModule)
    const correlationId = this.cls.get<string>('correlationId')

    // Add to response header
    if (correlationId) {
      response.setHeader('X-Correlation-Id', correlationId)
    }

    return next.handle().pipe(
      tap(() => {
        // Post-request processing (if needed)
      }),
    )
  }
}
