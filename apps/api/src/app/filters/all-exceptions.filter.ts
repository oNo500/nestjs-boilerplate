import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  Optional,
  Inject,
} from '@nestjs/common'
import { ClsService } from 'nestjs-cls'

import { ProblemDetailsFilter } from '@/app/filters/problem-details.filter'

import type {
  ExceptionFilter,
  ArgumentsHost } from '@nestjs/common'
import type { Request, Response } from 'express'

/**
 * Global exception filter - catches all unhandled exceptions
 * Delegates HTTP exceptions to ProblemDetailsFilter (RFC 9457)
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  constructor(
    @Optional() private readonly cls?: ClsService,
    @Optional()
    @Inject(ProblemDetailsFilter)
    private readonly problemDetailsFilter?: ProblemDetailsFilter,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    const request = context.getRequest<Request>()

    // Delegate HTTP exceptions to ProblemDetailsFilter
    if (exception instanceof HttpException && this.problemDetailsFilter) {
      return this.problemDetailsFilter.catch(exception, host)
    }

    // Handle non-HTTP exceptions (system errors)
    const status = HttpStatus.INTERNAL_SERVER_ERROR

    let message: string | string[] = 'Internal server error'
    if (exception instanceof Error) {
      message = exception.message
    }

    const requestId = this.cls?.getId()
    const correlationId = this.cls?.get<string>('correlationId')
    const traceId = this.cls?.get<string>('traceId')

    const errorResponse = {
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(requestId && { request_id: requestId }),
      ...(correlationId && { correlation_id: correlationId }),
      ...(traceId && { trace_id: traceId }),
      // Hide stack trace in production
      ...(process.env.NODE_ENV !== 'production'
        && exception instanceof Error && {
        stack: exception.stack,
      }),
    }

    const tracePrefix = this.buildTracePrefix(
      requestId,
      correlationId,
      traceId,
    )

    const logMessage = `${tracePrefix}${request.method} ${request.url} ${status}`
    if (exception instanceof Error) {
      this.logger.error(logMessage, exception.stack)
    } else {
      this.logger.error(logMessage, JSON.stringify(exception))
    }

    response.setHeader('Cache-Control', 'no-store')
    response.status(status).json(errorResponse)
  }

  /**
   * Build trace ID prefix for logging
   */
  private buildTracePrefix(
    requestId?: string,
    correlationId?: string,
    traceId?: string,
  ): string {
    const parts: string[] = []

    if (requestId) {
      parts.push(`req:${requestId}`)
    }
    if (correlationId) {
      parts.push(`corr:${correlationId}`)
    }
    if (traceId) {
      parts.push(`trace:${traceId}`)
    }

    return parts.length > 0 ? `[${parts.join('|')}] ` : ''
  }
}
