import { randomUUID } from 'node:crypto'

import { parseTraceparent } from '@/shared-kernel/infrastructure/utils/trace-context.util'

import type { Request } from 'express'
import type { ClsModuleOptions, ClsService } from 'nestjs-cls'

/**
 * Create CLS (Continuation-Local Storage) configuration
 *
 * Used for request context management, including:
 * - Request ID generation
 * - Correlation ID tracking
 * - W3C Trace Context parsing
 * - API version management
 */
export function createClsConfig(): ClsModuleOptions {
  return {
    global: true,
    middleware: {
      mount: true,
      generateId: true,
      idGenerator: (request: Request) => {
        // Use the client-provided X-Request-Id if present, otherwise generate a new UUID
        return (request.headers['x-request-id'] as string) || randomUUID()
      },
      setup: setupClsContext,
    },
  }
}

/**
 * Set up the CLS context
 *
 * Extracts and stores various tracing information from request headers
 */
function setupClsContext(cls: ClsService, request: Request) {
  // Store basic request information
  cls.set('userAgent', request.headers['user-agent'])
  cls.set('ip', request.ip)
  cls.set('method', request.method)
  cls.set('url', request.url)

  // Parse and store Correlation ID (business tracing)
  const correlationId
    = (request.headers['x-correlation-id'] as string) || randomUUID()
  cls.set('correlationId', correlationId)

  // Parse W3C Trace Context (distributed tracing)
  const traceparent = request.headers.traceparent as string
  if (traceparent) {
    const traceContext = parseTraceparent(traceparent)
    if (traceContext) {
      cls.set('traceId', traceContext.traceId)
      cls.set('parentId', traceContext.parentId)
      cls.set('traceFlags', traceContext.traceFlags)
    }
  }

  // Store Tracestate (optional distributed tracing state)
  const tracestate = request.headers.tracestate as string
  if (tracestate) {
    cls.set('tracestate', tracestate)
  }
}
