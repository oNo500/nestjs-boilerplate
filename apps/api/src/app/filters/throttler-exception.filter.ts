import { Catch, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ThrottlerException } from '@nestjs/throttler'
import { ClsService } from 'nestjs-cls'

import type { Env } from '@/app/config/env.schema'
import type { ProblemDetailsDto } from '@/shared-kernel/infrastructure/dtos/problem-details.dto'
import type { ExceptionFilter, ArgumentsHost } from '@nestjs/common'
import type { Response, Request } from 'express'

/**
 * Throttler exception filter
 *
 * Spec:
 * - RFC 6585 §4 (429 Too Many Requests): https://www.rfc-editor.org/rfc/rfc6585.html#section-4
 * - IETF Rate Limit Headers: https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers
 *
 * Features:
 * - Catches @nestjs/throttler rate limit exceptions
 * - Adds the RFC 6585 required Retry-After header
 * - Adds X-RateLimit-* headers
 * - Uses RFC 9457 Problem Details format
 */
@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ThrottlerExceptionFilter.name)

  constructor(
    private readonly cls: ClsService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  catch(_exception: ThrottlerException, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    const request = context.getRequest<Request>()

    const ttl = Math.floor(this.configService.get('THROTTLE_TTL', { infer: true }) / 1000)
    const limit = this.configService.get('THROTTLE_LIMIT', { infer: true })
    const resetTime = Math.floor(Date.now() / 1000) + ttl

    // Set rate limit response headers
    // RFC 6585 §4: Retry-After header (required)
    response.setHeader('Retry-After', ttl.toString())

    // IETF Rate Limit Headers draft
    response.setHeader('X-RateLimit-Limit', limit.toString())
    response.setHeader('X-RateLimit-Remaining', '0')
    response.setHeader('X-RateLimit-Reset', resetTime.toString())

    // RFC 9457 media type
    response.setHeader('Content-Type', 'application/problem+json')

    // Build Problem Details response
    const problemDetails: ProblemDetailsDto = {
      type: `${this.configService.get('API_BASE_URL', { infer: true })}/errors/rate-limit-exceeded`,
      title: 'Too Many Requests',
      status: 429,
      instance: request.url,
      request_id: this.cls.getId(),
      correlation_id: this.cls.get('correlationId'),
      trace_id: this.cls.get('traceId'),
      timestamp: new Date().toISOString(),
      errors: [{
        code: 'RATE_LIMIT_EXCEEDED',
        message: `You have sent ${limit} requests within ${ttl} seconds. Please try again later.`,
        constraints: {
          limit,
          remaining: 0,
          reset: resetTime,
        },
      }],
    }

    // Log warning
    this.logger.warn(
      `Rate limit exceeded: ${request.method} ${request.url} - ${request.ip}`,
    )

    response.status(429).json(problemDetails)
  }
}
