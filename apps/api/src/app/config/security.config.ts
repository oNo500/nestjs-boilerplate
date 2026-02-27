import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'

/**
 * CORS cross-origin configuration
 *
 * Controls which origins are allowed to access the API
 */
export function createCorsConfig(allowedOrigins?: string[]): CorsOptions {
  return {
    origin: allowedOrigins ?? true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Correlation-Id',
      'Traceparent',
      'Tracestate',
    ],
    exposedHeaders: [
      'X-Request-Id',
      'X-Correlation-Id',
      'Trace-Id',
      'Link',
      'Location',
      'ETag',
      'Retry-After',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    credentials: true,
    maxAge: 3600,
  }
}

/**
 * Rate limiting configuration
 *
 * Prevents API abuse and DDoS attacks
 */
export const throttlerConfig = {
  // Time window (milliseconds)
  ttl: 60_000, // 60 seconds
  // Maximum number of requests within the time window
  limit: 10, // 10 requests per minute
  // Whether to ignore User-Agent
  ignoreUserAgents: [],
  // Whether to skip successful requests
  skipSuccessfulRequests: false,
  // Whether to skip failed requests
  skipFailedRequests: false,
}
