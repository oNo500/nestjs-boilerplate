import {
  Catch,
  HttpException,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClsService } from 'nestjs-cls'

import type { Env } from '@/app/config/env.schema'
import type { ProblemDetailsDto, FieldError } from '@/shared-kernel/infrastructure/dtos/problem-details.dto'
import type { ValidationErrorItem } from '@/shared-kernel/infrastructure/types/validation-error'
import type {
  ExceptionFilter,
  ArgumentsHost } from '@nestjs/common'
import type { Request, Response } from 'express'

/**
 * RFC 9457 Problem Details exception filter
 *
 * Spec: https://www.rfc-editor.org/rfc/rfc9457.html
 *
 * Features:
 * - Converts all HTTP exceptions to the standard Problem Details format
 * - Automatically extracts class-validator validation errors
 * - Includes request tracing info (Request ID, Correlation ID, Trace ID)
 *
 * Use cases:
 * - All HTTP exceptions (400, 401, 403, 404, 409, 422, 429, etc.)
 * - Validation errors (exceptions thrown by ValidationPipe)
 * - Business exceptions (manually thrown HttpException)
 */
@Catch(HttpException)
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name)

  constructor(
    private readonly cls: ClsService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  /**
   * Paths to suppress logging in development
   * e.g. Service Worker requests from frontend MSW
   */
  readonly #silentPaths = ['/mockServiceWorker.js']

  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    const request = context.getRequest<Request>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    // Silently handle specific paths (skip logging, return 404 directly)
    if (status === 404 && this.#silentPaths.includes(request.url)) {
      response.status(404).end()
      return
    }

    // Build Problem Details response
    const errorPayload = this.buildErrorPayload(
      exceptionResponse as string | Record<string, unknown>,
      exception,
      status,
    )
    const problemDetails: ProblemDetailsDto = {
      type: this.getTypeUri(status),
      title: this.getTitle(status, exception),
      status,
      instance: request.url,
      request_id: this.cls.getId(),
      correlation_id: this.cls.get('correlationId'),
      trace_id: this.cls.get('traceId'),
      timestamp: new Date().toISOString(),
      ...errorPayload,
    }

    // Log the request
    const logMessage = `${request.method} ${request.url} ${status}`
    if (status >= 500) {
      this.logger.error(logMessage, exception.stack)
    } else {
      this.logger.warn(logMessage)
    }

    // Set response headers (RFC 9457 recommended media type)
    response.setHeader('Content-Type', 'application/problem+json')
    // Prevent browsers from caching error responses
    response.setHeader('Cache-Control', 'no-store')

    response.status(status).json(problemDetails)
  }

  /**
   * Generate the problem type URI
   *
   * RFC 9457 §3.1.1: the type field should be a URI, ideally dereferenceable to human-readable documentation
   */
  private getTypeUri(status: number): string {
    const baseUrl = this.configService.get('API_BASE_URL', { infer: true })
    const errorType = this.getErrorType(status)
    return `${baseUrl}/errors/${errorType}`
  }

  /**
   * Get the error type identifier (kebab-case)
   */
  private getErrorType(status: number): string {
    const typeMap: Record<number, string> = {
      400: 'bad-request',
      401: 'unauthorized',
      403: 'forbidden',
      404: 'not-found',
      409: 'conflict',
      422: 'validation-failed',
      429: 'rate-limit-exceeded',
      500: 'internal-server-error',
      502: 'bad-gateway',
      503: 'service-unavailable',
      504: 'gateway-timeout',
    }

    return typeMap[status] ?? 'unknown-error'
  }

  /**
   * Get the error title (short summary)
   *
   * RFC 9457 §3.1.2: title should be a short, human-readable summary
   */
  private getTitle(status: number, exception: HttpException): string {
    const titleMap: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    }

    return titleMap[status] ?? exception.name
  }

  /**
   * Build error payload fields
   *
   * Strategy:
   * 1. Validation errors (400/422 with field-level data) → code/detail at top level + errors[]
   * 2. Business errors (exceptionResponse has explicit code) → code/detail at top level, no errors[]
   * 3. Fallback → code/detail at top level from fallback map
   */
  private buildErrorPayload(
    exceptionResponse: string | Record<string, unknown>,
    exception: HttpException,
    status: number,
  ): Pick<ProblemDetailsDto, 'code' | 'detail' | 'errors'> {
    // 1. Validation errors (class-validator)
    if (status === 400 || status === 422) {
      const validationErrors = this.extractValidationErrors(exceptionResponse)
      if (validationErrors && validationErrors.length > 0) {
        return {
          code: 'VALIDATION_FAILED',
          detail: 'Request validation failed',
          errors: validationErrors,
        }
      }
    }

    // 2. Business error with explicit code
    if (typeof exceptionResponse === 'object' && 'code' in exceptionResponse) {
      const code = exceptionResponse.code as string
      const msg = exceptionResponse.message
      const detail = typeof msg === 'string' ? msg : exception.message
      return { code, detail }
    }

    // 3. Fallback: no explicit code
    const detail = typeof exceptionResponse === 'string'
      ? exceptionResponse
      : exception.message
    const fallbackCodeMap: Record<number, string> = {
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'RESOURCE_NOT_FOUND',
      409: 'RESOURCE_CONFLICT',
      429: 'RATE_LIMIT_EXCEEDED',
    }
    const code = status >= 500
      ? 'INTERNAL_SERVER_ERROR'
      : (fallbackCodeMap[status] ?? 'BAD_REQUEST')
    return { code, detail }
  }

  /**
   * Extract validation error details
   *
   * Converts class-validator error messages into a structured array of field-level errors
   */
  private extractValidationErrors(
    exceptionResponse: string | Record<string, unknown>,
  ): FieldError[] | undefined {
    if (
      typeof exceptionResponse === 'object'
      && 'message' in exceptionResponse
      && Array.isArray(exceptionResponse.message)
    ) {
      const errors: FieldError[] = []

      // Iterate over each validation error (may be a string or ValidationError object)
      for (const item of exceptionResponse.message) {
        if (typeof item === 'string') {
          // Legacy format: array of strings (e.g. ["email must be an email"])
          const parts = item.split(' ')
          const field = parts[0] ?? 'unknown'

          errors.push({
            field,
            pointer: `/${field}`,
            code: 'VALIDATION_ERROR',
            message: item,
          })
        } else if (this.isValidationErrorItem(item)) {
          // New format: array of ValidationError objects
          // { property: 'email', constraints: { isEmail: '...' }, contexts: { isEmail: { code: 'INVALID_EMAIL' } } }
          const field = item.property
          const constraints = item.constraints ?? {}
          const contexts = item.contexts ?? {}

          // Generate one field error per constraint
          for (const [constraintName, message] of Object.entries(constraints)) {
            const contextCode = contexts[constraintName]?.code
            errors.push({
              field,
              pointer: `/${field}`,
              code: contextCode ?? 'VALIDATION_ERROR',
              message,
            })
          }
        }
      }

      return errors.length > 0 ? errors : undefined
    }

    return undefined
  }

  /**
   * Type guard: checks whether the value is a ValidationErrorItem
   */
  private isValidationErrorItem(item: unknown): item is ValidationErrorItem {
    return (
      typeof item === 'object'
      && item !== null
      && 'property' in item
      && typeof (item as ValidationErrorItem).property === 'string'
    )
  }
}
