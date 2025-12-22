import { RequestMethod } from '@nestjs/common'

import { redactCensor, redactPaths } from './redaction.config'

import type { Env } from '@/app/config/env.schema'
import type { ConfigService } from '@nestjs/config'
import type { Params } from 'nestjs-pino'
import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * Create nestjs-pino configuration
 */
export function createLoggerConfig(config: ConfigService<Env, true>): Params {
  const nodeEnv: 'development' | 'production' | 'test' = config.get('NODE_ENV')
  const isProduction = nodeEnv === 'production'
  const logLevel = getLogLevel(nodeEnv)

  return {
    pinoHttp: {
      level: logLevel,

      // Only log API paths (whitelist)
      autoLogging: {
        ignore: (req) => {
          const url = req.url ?? ''
          return !url.startsWith('/v1/') && !url.startsWith('/v2/')
        },
      },

      // Sensitive data redaction
      redact: {
        paths: redactPaths,
        censor: redactCensor,
      },

      // Serializers
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

      // Custom log properties from request headers
      customProps: (req: IncomingMessage) => ({
        correlationId: req.headers['x-correlation-id'],
        traceId: extractTraceId(req.headers.traceparent as string | undefined),
      }),

      customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
        return `${req.method} ${req.url} ${res.statusCode}`
      },

      customErrorMessage: (req: IncomingMessage, res: ServerResponse, error: Error) => {
        return `${req.method} ${req.url} ${res.statusCode} - ${error.message}`
      },

      // Dev: use pino-pretty
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

    // Exclude health check routes
    exclude: [
      { method: RequestMethod.GET, path: 'v1/health' },
      { method: RequestMethod.GET, path: 'v1/health/live' },
      { method: RequestMethod.GET, path: 'v1/health/ready' },
    ],
  }
}

/**
 * Get log level by environment
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
 * Extract trace-id from W3C traceparent header
 */
function extractTraceId(traceparent: string | undefined): string | undefined {
  if (!traceparent) {
    return undefined
  }

  const parts = traceparent.split('-')
  return parts[1]
}
