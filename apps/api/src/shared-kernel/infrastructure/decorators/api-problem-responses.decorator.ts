import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

import { ProblemDetailsDto } from '@/shared-kernel/infrastructure/dtos/problem-details.dto'

/**
 * Swagger decorator: RFC 9457 Problem Details error responses
 *
 * Provides reusable standard error response documentation
 *
 * Usage example:
 * ```typescript
 * @ApiBadRequestResponse()
 * @ApiUnauthorizedResponse()
 * @ApiNotFoundResponse()
 * @Post()
 * async create() { ... }
 * ```
 */

/**
 * 400 Bad Request - Invalid request format
 *
 * Use cases:
 * - Request body is not valid JSON
 * - Path parameter format error (e.g., expects UUID but got plain string)
 */
export function ApiBadRequestResponse(description?: string) {
  return ApiResponse({
    status: 400,
    description: description ?? 'Invalid request format',
    type: ProblemDetailsDto,
    content: {
      'application/problem+json': {
        example: {
          type: 'https://api.example.com/errors/bad-request',
          title: 'Invalid request format',
          status: 400,
          detail: 'Request data format is incorrect or contains invalid characters',
          instance: '/users',
          request_id: 'req_abc123',
          timestamp: '2024-11-03T10:30:00Z',
        },
      },
    },
  })
}

/**
 * 401 Unauthorized - Authentication failed
 *
 * Use cases:
 * - Missing authentication token
 * - Invalid or expired token
 */
export function ApiUnauthorizedResponse(description?: string) {
  return ApiResponse({
    status: 401,
    description: description ?? 'Authentication failed',
    type: ProblemDetailsDto,
    content: {
      'application/problem+json': {
        example: {
          type: 'https://api.example.com/errors/unauthorized',
          title: 'Authentication failed',
          status: 401,
          detail: 'Missing valid credentials or token expired',
          instance: '/users/me',
          request_id: 'req_abc123',
          timestamp: '2024-11-03T10:30:00Z',
        },
      },
    },
  })
}

/**
 * 403 Forbidden - Insufficient permissions
 *
 * Use cases:
 * - User authenticated but not authorized for resource
 * - Attempting to access other user's private data
 */
export function ApiForbiddenResponse(description?: string) {
  return ApiResponse({
    status: 403,
    description: description ?? 'Insufficient permissions',
    type: ProblemDetailsDto,
    content: {
      'application/problem+json': {
        example: {
          type: 'https://api.example.com/errors/forbidden',
          title: 'Insufficient permissions',
          status: 403,
          detail: 'You do not have permission to access this resource',
          instance: '/admin/users',
          request_id: 'req_abc123',
          timestamp: '2024-11-03T10:30:00Z',
        },
      },
    },
  })
}

/**
 * 404 Not Found - Resource not found
 *
 * Use cases:
 * - Requested resource ID does not exist
 * - Route path does not exist
 */
export function ApiNotFoundResponse(description?: string) {
  return ApiResponse({
    status: 404,
    description: description ?? 'Resource not found',
    type: ProblemDetailsDto,
    content: {
      'application/problem+json': {
        example: {
          type: 'https://api.example.com/errors/not-found',
          title: 'Resource not found',
          status: 404,
          detail: 'The requested resource was not found',
          instance: '/users/usr_nonexistent',
          request_id: 'req_abc123',
          timestamp: '2024-11-03T10:30:00Z',
        },
      },
    },
  })
}

/**
 * 409 Conflict - Resource conflict
 *
 * Use cases:
 * - Attempting to create existing resource (e.g., email already registered)
 * - Concurrent modification conflict
 */
export function ApiConflictResponse(description?: string) {
  return ApiResponse({
    status: 409,
    description: description ?? 'Resource conflict',
    type: ProblemDetailsDto,
    content: {
      'application/problem+json': {
        example: {
          type: 'https://api.example.com/errors/conflict',
          title: 'Resource conflict',
          status: 409,
          detail: 'Resource already exists or conflicts',
          instance: '/users/register',
          request_id: 'req_abc123',
          timestamp: '2024-11-03T10:30:00Z',
        },
      },
    },
  })
}

/**
 * 422 Unprocessable Entity - Validation failed
 *
 * Use cases:
 * - Request data failed business rule validation
 * - class-validator validation failed
 *
 * Note: Includes field-level error details (errors array)
 */
export function ApiValidationFailedResponse(description?: string) {
  return ApiResponse({
    status: 422,
    description: description ?? 'Validation failed',
    type: ProblemDetailsDto,
    content: {
      'application/problem+json': {
        example: {
          type: 'https://api.example.com/errors/validation-failed',
          title: 'Validation failed',
          status: 422,
          detail: 'Submitted data failed business rule validation',
          instance: '/users/register',
          request_id: 'req_abc123',
          timestamp: '2024-11-03T10:30:00Z',
          errors: [
            {
              field: 'email',
              pointer: '/email',
              code: 'INVALID_EMAIL',
              message: 'email must be an email',
            },
            {
              field: 'password',
              pointer: '/password',
              code: 'INVALID_LENGTH',
              message: 'password must be longer than or equal to 8 characters',
            },
          ],
        },
      },
    },
  })
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 *
 * Use cases:
 * - Triggered rate limiting (ThrottlerGuard)
 */
export function ApiTooManyRequestsResponse(description?: string) {
  return ApiResponse({
    status: 429,
    description: description ?? 'Rate limit exceeded',
    type: ProblemDetailsDto,
    content: {
      'application/problem+json': {
        example: {
          type: 'https://api.example.com/errors/rate-limit-exceeded',
          title: 'Rate limit exceeded',
          status: 429,
          detail: 'Too many requests, please try again later',
          instance: '/users/login',
          request_id: 'req_abc123',
          timestamp: '2024-11-03T10:30:00Z',
        },
      },
    },
  })
}

/**
 * 500 Internal Server Error - Internal server error
 *
 * Use cases:
 * - Unexpected system error
 * - Database connection failure
 * - Third-party service error
 */
export function ApiInternalServerErrorResponse(description?: string) {
  return ApiResponse({
    status: 500,
    description: description ?? 'Internal server error',
    type: ProblemDetailsDto,
    content: {
      'application/problem+json': {
        example: {
          type: 'https://api.example.com/errors/internal-server-error',
          title: 'Internal server error',
          status: 500,
          detail: 'Server encountered an unexpected error, please contact support',
          instance: '/users',
          request_id: 'req_abc123',
          timestamp: '2024-11-03T10:30:00Z',
        },
      },
    },
  })
}

/**
 * Combined decorator: Common error responses
 *
 * Includes: 400, 422, 429, 500
 *
 * Use cases: Most API endpoints
 */
export function ApiCommonErrorResponses() {
  return applyDecorators(
    ApiBadRequestResponse(),
    ApiValidationFailedResponse(),
    ApiTooManyRequestsResponse(),
    ApiInternalServerErrorResponse(),
  )
}
