import {
  Catch,
  ConflictException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Optional,
  Inject,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DrizzleQueryError } from 'drizzle-orm'
import { ClsService } from 'nestjs-cls'
import { DatabaseError } from 'pg'

import { ProblemDetailsFilter } from '@/app/filters/problem-details.filter'

import type { Env } from '@/app/config/env.schema'
import type { ProblemDetailsDto } from '@/shared-kernel/infrastructure/dtos/problem-details.dto'
import type {
  ExceptionFilter,
  ArgumentsHost } from '@nestjs/common'
import type { Request, Response } from 'express'

/**
 * Maps a pg DatabaseError to a NestJS HttpException.
 *
 * Postgres error class reference:
 * https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
function mapDatabaseError(error: DatabaseError): HttpException {
  switch (error.code) {
    // Class 23 — Integrity Constraint Violation
    case '23505': { // unique_violation
      return new ConflictException({
        code: 'RESOURCE_CONFLICT',
        message: 'A resource with the same unique field already exists',
      })
    }
    case '23503': { // foreign_key_violation
      return new UnprocessableEntityException({
        code: 'RESOURCE_CONFLICT',
        message: 'Referenced resource does not exist',
      })
    }
    case '23502': { // not_null_violation
      return new UnprocessableEntityException({
        code: 'RESOURCE_CONFLICT',
        message: 'A required field is missing',
      })
    }
    case '23514': { // check_violation
      return new UnprocessableEntityException({
        code: 'RESOURCE_CONFLICT',
        message: 'Data failed a database constraint check',
      })
    }
    // Class 08 — Connection Exception
    case '08000':
    case '08003':
    case '08006':
    case '08001':
    case '08004': {
      return new ServiceUnavailableException({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database connection error',
      })
    }
    // Class 57 — Operator Intervention (e.g. query_canceled, admin_shutdown)
    case '57014': { // query_canceled (e.g. statement_timeout)
      return new ServiceUnavailableException({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database query timed out',
      })
    }
    default: {
      return new InternalServerErrorException({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected database error occurred',
      })
    }
  }
}

/**
 * Global exception filter
 *
 * Catches all unhandled exceptions, including non-HTTP exceptions.
 * Prevents sensitive error information from leaking to the client.
 *
 * For HTTP exceptions, delegates to ProblemDetailsFilter (RFC 9457 format).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  constructor(
    @Optional() private readonly cls?: ClsService,
    @Optional()
    @Inject(ProblemDetailsFilter)
    private readonly problemDetailsFilter?: ProblemDetailsFilter,
    @Optional() private readonly configService?: ConfigService<Env, true>,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    const request = context.getRequest<Request>()

    // For HTTP exceptions, delegate to ProblemDetailsFilter (RFC 9457 format)
    if (exception instanceof HttpException && this.problemDetailsFilter) {
      return this.problemDetailsFilter.catch(exception, host)
    }

    // Map Postgres DatabaseError to an appropriate HttpException, then re-delegate
    if (exception instanceof DrizzleQueryError && this.problemDetailsFilter) {
      const cause = exception.cause
      if (cause instanceof DatabaseError) {
        const httpException = mapDatabaseError(cause)
        this.logger.warn(
          `[DB] code=${cause.code} table=${cause.table ?? 'unknown'} constraint=${cause.constraint ?? 'none'}`,
        )
        return this.problemDetailsFilter.catch(httpException, host)
      }
      // cause is not a pg.DatabaseError (rare), fall through to 500 fallback
    }

    // Only handle non-HTTP exceptions (system errors)
    const status = HttpStatus.INTERNAL_SERVER_ERROR

    // Get error message
    const isProduction = this.configService?.get('NODE_ENV', { infer: true }) === 'production'
    let message = 'Internal server error'
    if (exception instanceof Error) {
      message = isProduction ? 'The server encountered an unexpected error' : exception.message
    }

    // Get tracing IDs
    const requestId = this.cls?.getId()
    const correlationId = this.cls?.get<string>('correlationId')
    const traceId = this.cls?.get<string>('traceId')

    // Build Problem Details response (RFC 9457 format)
    const baseUrl = this.configService?.get('API_BASE_URL', { infer: true }) ?? 'https://api.example.com'
    const problemDetails: ProblemDetailsDto = {
      type: `${baseUrl}/errors/internal-server-error`,
      title: 'Internal Server Error',
      status,
      instance: request.url,
      request_id: requestId,
      correlation_id: correlationId,
      trace_id: traceId,
      timestamp: new Date().toISOString(),
      code: 'INTERNAL_SERVER_ERROR',
      detail: message,
    }

    // Build trace prefix for log message
    const tracePrefix = this.buildTracePrefix(
      requestId,
      correlationId,
      traceId,
    )

    // Log full error stack
    const logMessage = `${tracePrefix}${request.method} ${request.url} ${status}`
    if (exception instanceof Error) {
      this.logger.error(logMessage, exception.stack)
    } else {
      this.logger.error(logMessage, JSON.stringify(exception))
    }

    // Set response headers (RFC 9457 recommended media type)
    response.setHeader('Content-Type', 'application/problem+json')
    // Prevent browsers from caching error responses
    response.setHeader('Cache-Control', 'no-store')

    response.status(status).json(problemDetails)
  }

  /**
   * Build trace ID prefix
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
