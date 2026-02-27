import { RequestMethod } from '@nestjs/common'

import { redactCensor, redactPaths } from './redaction.config'

import type { Env } from '@/app/config/env.schema'
import type { ConfigService } from '@nestjs/config'
import type { Params } from 'nestjs-pino'
import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * Create nestjs-pino configuration
 *
 * @param config - NestJS ConfigService
 * @returns nestjs-pino module configuration
 */
export function createLoggerConfig(config: ConfigService<Env, true>): Params {
  const nodeEnv: 'development' | 'production' | 'test' = config.get('NODE_ENV')
  const isProduction = nodeEnv === 'production'
  const logLevel = getLogLevel(nodeEnv)

  return {
    pinoHttp: {
      // Log level
      level: logLevel,

      // Only log requests to /api/ paths (allowlist approach)
      autoLogging: {
        ignore: (req) => {
          const url = req.url ?? ''
          // Only log requests starting with /api/
          return !url.startsWith('/api/')
        },
      },

      // Sensitive field redaction
      redact: {
        paths: redactPaths,
        censor: redactCensor,
      },

      // Serializers: control which fields are included in log output
      serializers: {
        req: (req: IncomingMessage & { id?: string, query?: unknown, params?: unknown }) => ({
          id: req.id,
          method: req.method,
          url: req.url,
          query: req.query,
          params: req.params,
          remoteAddress: req.socket?.remoteAddress,
          remotePort: req.socket?.remotePort,
        }),
        res: (res: ServerResponse) => ({
          statusCode: res.statusCode,
        }),
        err: (error: Error) => ({
          type: error.constructor.name,
          message: error.message,
          stack: error.stack,
        }),
      },

      // Custom log properties: extract tracing info from the request
      customProps: (req: IncomingMessage) => ({
        correlationId: req.headers['x-correlation-id'],
        traceId: extractTraceId(req.headers.traceparent as string | undefined),
      }),

      // Custom log messages
      customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
        return `${req.method} ${req.url} ${res.statusCode}`
      },

      customErrorMessage: (req: IncomingMessage, res: ServerResponse, error: Error) => {
        return `${req.method} ${req.url} ${res.statusCode} - ${error.message}`
      },

      // Use pino-pretty for human-readable output in development
      ...(isProduction
        ? {}
        : {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                singleLine: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
                messageFormat: '{context} | {msg}',
              },
            },
          }),
    },

    // Exclude health check routes (high-frequency; avoid log spam)
    exclude: [
      { method: RequestMethod.GET, path: 'health' },
      { method: RequestMethod.GET, path: 'health/live' },
      { method: RequestMethod.GET, path: 'health/ready' },
    ],
  }
}

/**
 * Get the log level for the given environment
 */
function getLogLevel(nodeEnv: 'development' | 'production' | 'test'): string {
  switch (nodeEnv) {
    case 'production': {
      return 'info'
    }
    case 'test': {
      return 'warn'
    }
    case 'development': {
      return 'debug'
    }
  }
}

/**
 * Extract trace-id from the W3C Trace Context traceparent header
 *
 * traceparent format: version-trace_id-parent_id-trace_flags
 * Example: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
 */
function extractTraceId(traceparent: string | undefined): string | undefined {
  if (!traceparent) {
    return undefined
  }

  const parts = traceparent.split('-')
  return parts[1] // trace-id is the second part
}
