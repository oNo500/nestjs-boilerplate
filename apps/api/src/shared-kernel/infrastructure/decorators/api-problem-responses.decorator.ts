import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

import { ProblemDetailsDto } from '@/shared-kernel/infrastructure/dtos/problem-details.dto'

/**
 * Swagger decorators: RFC 9457 Problem Details error responses
 *
 * Provides reusable standard error response documentation to reduce boilerplate.
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
 * 400 Bad Request - malformed request
 *
 * Use cases:
 * - Request body is not valid JSON
 * - Path parameter format is wrong (e.g. UUID expected but plain string given)
 */
export function ApiBadRequestResponse(description?: string) {
  return ApiResponse({
    status: 400,
    description: description ?? 'Bad Request',
    type: ProblemDetailsDto,
    content: {
      'application/problem+json': {
        example: {
          type: 'https://api.example.com/errors/bad-request',
          title: 'Bad Request',
          status: 400,
          instance: '/users',
          request_id: 'req_abc123',
          timestamp: '2024-11-03T10:30:00Z',
          code: 'BAD_REQUEST',
          detail: 'The request data is malformed or contains invalid characters',
        },
      },
    },
  })
}

/**
 * 401 Unauthorized - authentication failed
 *
 * Use cases:
 * - Missing authentication token
 * - Token is invalid or has expired
 */
export function ApiUnauthorizedResponse(description?: string) {
  return ApiResponse({
    status: 401,
    description: description ?? 'Unauthorized',
    type: ProblemDetailsDto,
    content: {
      'application/problem+json': {
        example: {
          type: 'https://api.example.com/errors/unauthorized',
          title: 'Unauthorized',
          status: 401,
          instance: '/users/me',
          request_id: 'req_abc123',
          timestamp: '2024-11-03T10:30:00Z',
          code: 'UNAUTHORIZED',
          detail: 'Missing valid credentials or the token has expired',
        },
      },
    },
  })
}

/**
 * 403 Forbidden - insufficient permissions
 *
 * Use cases:
 * - User is authenticated but not authorized to access the resource
 * - Attempting to access another user's private data
 */
export function ApiForbiddenResponse(description?: string) {
  return ApiResponse({
    status: 403,
    description: description ?? 'Forbidden',
    type: ProblemDetailsDto,
    content: {
      'application/problem+json': {
        example: {
          type: 'https://api.example.com/errors/forbidden',
          title: 'Forbidden',
          status: 403,
          instance: '/admin/users',
          request_id: 'req_abc123',
          timestamp: '2024-11-03T10:30:00Z',
          code: 'FORBIDDEN',
          detail: 'You do not have permission to access this resource',
        },
      },
    },
  })
}

/**
 * 404 Not Found - resource does not exist
 *
 * Use cases:
 * - The requested resource ID does not exist
 * - The route path does not exist
 */
export function ApiNotFoundResponse(description?: string) {
  return ApiResponse({
    status: 404,
    description: description ?? 'Not Found',
    type: ProblemDetailsDto,
    content: {
      'application/problem+json': {
        example: {
          type: 'https://api.example.com/errors/not-found',
          title: 'Not Found',
          status: 404,
          instance: '/users/usr_nonexistent',
          request_id: 'req_abc123',
          timestamp: '2024-11-03T10:30:00Z',
          code: 'RESOURCE_NOT_FOUND',
          detail: 'The requested resource was not found',
        },
      },
    },
  })
}

/**
 * 409 Conflict - resource conflict
 *
 * Use cases:
 * - Attempting to create a resource that already exists (e.g. email already registered)
 * - Concurrent modification conflict
 */
export function ApiConflictResponse(description?: string) {
  return ApiResponse({
    status: 409,
    description: description ?? 'Conflict',
    type: ProblemDetailsDto,
    content: {
      'application/problem+json': {
        example: {
          type: 'https://api.example.com/errors/conflict',
          title: 'Conflict',
          status: 409,
          instance: '/users/register',
          request_id: 'req_abc123',
          timestamp: '2024-11-03T10:30:00Z',
          code: 'RESOURCE_CONFLICT',
          detail: 'The resource already exists or there is a conflict',
        },
      },
    },
  })
}

/**
 * 422 Unprocessable Entity - request validation failed
 *
 * Use cases:
 * - Request data fails business rule validation
 * - class-validator validation failed
 *
 * Note: includes field-level error details in the errors array
 */
export function ApiValidationFailedResponse(description?: string) {
  return ApiResponse({
    status: 422,
    description: description ?? 'Unprocessable Entity',
    type: ProblemDetailsDto,
    content: {
      'application/problem+json': {
        example: {
          type: 'https://api.example.com/errors/validation-failed',
          title: 'Unprocessable Entity',
          status: 422,
          instance: '/users/register',
          request_id: 'req_abc123',
          timestamp: '2024-11-03T10:30:00Z',
          code: 'VALIDATION_FAILED',
          detail: 'Request validation failed',
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
 * 429 Too Many Requests - rate limit exceeded
 *
 * Use cases:
 * - Rate limit triggered (ThrottlerGuard)
 */
export function ApiTooManyRequestsResponse(description?: string) {
  return ApiResponse({
    status: 429,
    description: description ?? 'Too Many Requests',
    type: ProblemDetailsDto,
    content: {
      'application/problem+json': {
        example: {
          type: 'https://api.example.com/errors/rate-limit-exceeded',
          title: 'Too Many Requests',
          status: 429,
          instance: '/users/login',
          request_id: 'req_abc123',
          timestamp: '2024-11-03T10:30:00Z',
          code: 'RATE_LIMIT_EXCEEDED',
          detail: 'Your request rate is too high. Please try again later.',
        },
      },
    },
  })
}

/**
 * 500 Internal Server Error
 *
 * Use cases:
 * - Unexpected system error
 * - Database connection failure
 * - Third-party service error
 */
export function ApiInternalServerErrorResponse(description?: string) {
  return ApiResponse({
    status: 500,
    description: description ?? 'Internal Server Error',
    type: ProblemDetailsDto,
    content: {
      'application/problem+json': {
        example: {
          type: 'https://api.example.com/errors/internal-server-error',
          title: 'Internal Server Error',
          status: 500,
          instance: '/users',
          request_id: 'req_abc123',
          timestamp: '2024-11-03T10:30:00Z',
          code: 'INTERNAL_SERVER_ERROR',
          detail: 'The server encountered an unexpected error. Please contact support.',
        },
      },
    },
  })
}

/**
 * Composite decorator: common error responses
 *
 * Includes: 400, 422, 429, 500
 *
 * Use cases: most API endpoints
 */
export function ApiCommonErrorResponses() {
  return applyDecorators(
    ApiBadRequestResponse(),
    ApiValidationFailedResponse(),
    ApiTooManyRequestsResponse(),
    ApiInternalServerErrorResponse(),
  )
}
