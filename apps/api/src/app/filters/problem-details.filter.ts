import {
  Catch,
  HttpException,
  Logger,
} from '@nestjs/common'
import { ClsService } from 'nestjs-cls'

import type { ProblemDetailsDto, FieldError } from '@/shared-kernel/infrastructure/dtos/problem-details.dto'
import type { ValidationErrorItem } from '@/shared-kernel/infrastructure/types/validation-error'
import type {
  ExceptionFilter,
  ArgumentsHost } from '@nestjs/common'
import type { Request, Response } from 'express'

/**
 * RFC 9457 Problem Details exception filter
 * Converts HTTP exceptions to standard Problem Details format
 */
@Catch(HttpException)
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name)

  constructor(private readonly cls: ClsService) {}

  /**
   * Silent paths in dev (no logging)
   */
  readonly #silentPaths = ['/mockServiceWorker.js']

  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    const request = context.getRequest<Request>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    // Silent handling for specific paths
    if (status === 404 && this.#silentPaths.includes(request.url)) {
      response.status(404).end()
      return
    }

    const problemDetails: ProblemDetailsDto = {
      type: this.getTypeUri(status),
      title: this.getTitle(status, exception),
      status,
      detail: this.getDetail(
        exceptionResponse as string | Record<string, unknown>,
        exception,
      ),
      instance: request.url,
      request_id: this.cls.getId(),
      correlation_id: this.cls.get('correlationId'),
      trace_id: this.cls.get('traceId'),
      timestamp: new Date().toISOString(),
    }

    // Add field-level errors for validation failures
    if (status === 400 || status === 422) {
      const errors = this.extractValidationErrors(
        exceptionResponse as string | Record<string, unknown>,
      )
      if (errors) {
        problemDetails.errors = errors
      }
    }

    const logMessage = `${request.method} ${request.url} ${status}`
    if (status >= 500) {
      this.logger.error(logMessage, exception.stack)
    } else {
      this.logger.warn(logMessage)
    }

    response.setHeader('Content-Type', 'application/problem+json')
    response.setHeader('Cache-Control', 'no-store')

    response.status(status).json(problemDetails)
  }

  /**
   * Generate problem type URI (RFC 9457 §3.1.1)
   */
  private getTypeUri(status: number): string {
    const baseUrl = process.env.API_BASE_URL ?? 'https://api.example.com'
    const errorType = this.getErrorType(status)
    return `${baseUrl}/errors/${errorType}`
  }

  /**
   * Get error type identifier (kebab-case)
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
   * Get error title (RFC 9457 §3.1.2)
   */
  private getTitle(status: number, exception: HttpException): string {
    const titleMap: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Validation Failed',
      429: 'Rate Limit Exceeded',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    }

    return titleMap[status] ?? exception.name
  }

  /**
   * Get detailed description (RFC 9457 §3.1.4)
   */
  private getDetail(
    exceptionResponse: string | Record<string, unknown>,
    exception: HttpException,
  ): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse
    }

    if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      const message = exceptionResponse.message
      if (Array.isArray(message)) {
        return this.formatValidationErrors(message)
      }
      if (typeof message === 'string') {
        return message
      }
    }

    return exception.message
  }

  /**
   * Format validation errors into detail string
   */
  private formatValidationErrors(messages: unknown[]): string {
    const details: string[] = []

    for (const item of messages) {
      if (typeof item === 'string') {
        details.push(item)
      } else if (this.isValidationErrorItem(item)) {
        const field = item.property
        const constraints = item.constraints ?? {}
        for (const message of Object.values(constraints)) {
          details.push(`${field}: ${message}`)
        }
      }
    }

    return details.length > 0 ? details.join('; ') : 'Validation failed'
  }

  /**
   * Extract validation error details from class-validator
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

      for (const item of exceptionResponse.message) {
        if (typeof item === 'string') {
          const parts = item.split(' ')
          const field = parts[0] ?? 'unknown'

          errors.push({
            field,
            pointer: `/${field}`,
            code: this.inferErrorCode(item),
            message: item,
          })
        } else if (this.isValidationErrorItem(item)) {
          const field = item.property
          const constraints = item.constraints ?? {}

          for (const message of Object.values(constraints)) {
            errors.push({
              field,
              pointer: `/${field}`,
              code: this.inferErrorCode(message),
              message: message,
            })
          }
        }
      }

      return errors.length > 0 ? errors : undefined
    }

    return undefined
  }

  /**
   * Type guard for ValidationErrorItem
   */
  private isValidationErrorItem(item: unknown): item is ValidationErrorItem {
    return (
      typeof item === 'object'
      && item !== null
      && 'property' in item
      && typeof (item as ValidationErrorItem).property === 'string'
    )
  }

  /**
   * Infer error code from message
   */
  private inferErrorCode(message: string): string {
    const lowerMessage = message.toLowerCase()

    if (
      lowerMessage.includes('must be')
      || lowerMessage.includes('should be')
    ) {
      if (lowerMessage.includes('email')) return 'INVALID_EMAIL'
      if (lowerMessage.includes('url')) return 'INVALID_URL'
      if (lowerMessage.includes('uuid')) return 'INVALID_UUID'
      return 'INVALID_FORMAT'
    }

    if (
      lowerMessage.includes('required')
      || lowerMessage.includes('should not be empty')
    ) {
      return 'REQUIRED_FIELD'
    }

    if (
      lowerMessage.includes('too short')
      || lowerMessage.includes('too long')
    ) {
      return 'INVALID_LENGTH'
    }

    if (lowerMessage.includes('min') || lowerMessage.includes('max')) {
      return 'OUT_OF_RANGE'
    }

    return 'VALIDATION_ERROR'
  }
}
