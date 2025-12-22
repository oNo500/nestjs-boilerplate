import { randomUUID } from 'node:crypto'

import { parseTraceparent } from '@/shared-kernel/infrastructure/utils/trace-context.util'

import type { Request } from 'express'
import type { ClsModuleOptions, ClsService } from 'nestjs-cls'

/**
 * CLS (Continuation-Local Storage) config for request context management
 * Handles: Request ID, Correlation ID, W3C Trace Context, API versioning
 */
export function createClsConfig(): ClsModuleOptions {
  return {
    global: true,
    middleware: {
      mount: true,
      generateId: true,
      idGenerator: (request: Request) => {
        // Use client X-Request-Id or generate new UUID
        return (request.headers['x-request-id'] as string) || randomUUID()
      },
      setup: setupClsContext,
    },
  }
}

/**
 * Extract and store tracing info from request headers
 */
function setupClsContext(cls: ClsService, request: Request) {
  // Basic request info
  cls.set('userAgent', request.headers['user-agent'])
  cls.set('ip', request.ip)
  cls.set('method', request.method)
  cls.set('url', request.url)

  // Correlation ID for business tracing
  const correlationId
    = (request.headers['x-correlation-id'] as string) || randomUUID()
  cls.set('correlationId', correlationId)

  // W3C Trace Context for distributed tracing
  const traceparent = request.headers.traceparent as string
  if (traceparent) {
    const traceContext = parseTraceparent(traceparent)
    if (traceContext) {
      cls.set('traceId', traceContext.traceId)
      cls.set('parentId', traceContext.parentId)
      cls.set('traceFlags', traceContext.traceFlags)
    }
  }

  // Optional tracestate
  const tracestate = request.headers.tracestate as string
  if (tracestate) {
    cls.set('tracestate', tracestate)
  }

  // API version
  const apiVersion
    = (request.headers['api-version'] as string)
      || (request.headers['x-api-version'] as string)
  if (apiVersion) {
    cls.set('apiVersion', apiVersion)
  }
}
