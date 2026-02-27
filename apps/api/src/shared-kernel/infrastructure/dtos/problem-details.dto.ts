import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * RFC 9457 Problem Details standard error response
 *
 * Spec: https://www.rfc-editor.org/rfc/rfc9457.html
 *
 * Core fields (RFC 9457 standard):
 * - type: problem type URI (should be dereferenceable to documentation)
 * - title: short human-readable summary
 * - status: HTTP status code
 * - instance: URI reference where the problem occurred
 *
 * Extension fields (application-specific):
 * - request_id: request tracing ID
 * - correlation_id: correlation ID (cross-service tracing)
 * - trace_id: distributed tracing ID
 * - timestamp: time the error occurred
 * - errors: error details array (required; the single source of truth for all error information)
 */
export class ProblemDetailsDto {
  @ApiProperty({
    description: 'Problem type URI, should be dereferenceable to human-readable documentation',
    example: 'https://api.example.com/errors/validation-failed',
  })
  type: string

  @ApiProperty({
    description: 'Short human-readable summary',
    example: 'Unprocessable Entity',
  })
  title: string

  @ApiProperty({
    description: 'HTTP status code',
    example: 422,
  })
  status: number

  @ApiPropertyOptional({
    description: 'URI reference where the problem occurred',
    example: '/api/users',
  })
  instance?: string

  // ========== Extension fields (application-specific) ==========

  @ApiPropertyOptional({
    description: 'Request tracing ID',
    example: 'req_xyz789',
  })
  request_id?: string

  @ApiPropertyOptional({
    description: 'Correlation ID (business transaction tracing)',
    example: 'corr_shop_session_abc123',
  })
  correlation_id?: string

  @ApiPropertyOptional({
    description: 'Distributed tracing ID (W3C Trace Context)',
    example: '4bf92f3577b34da6a3ce929d0e0e4736',
  })
  trace_id?: string

  @ApiPropertyOptional({
    description: 'Time the error occurred (ISO 8601 format)',
    example: '2024-11-03T10:30:00Z',
  })
  timestamp?: string

  // ========== Error details array (required) ==========

  @ApiProperty({
    description: 'Error details array (single source of truth for all error info; field present = field-level error, field absent = general error)',
    type: [Object],
    example: [
      {
        field: 'email',
        pointer: '/email',
        code: 'INVALID_EMAIL',
        message: 'email must be a valid email address',
      },
    ],
  })
  errors: FieldError[]
}

/**
 * Error detail
 *
 * Spec:
 * - JSON Pointer (RFC 6901): https://www.rfc-editor.org/rfc/rfc6901.html
 * - Google AIP-193 error model: https://google.aip.dev/193
 *
 * Usage rules:
 * - field present: field-level validation error (e.g. invalid email format)
 * - field absent: general error (e.g. business rule error, system error)
 */
export interface FieldError {
  /**
   * Field name (optional)
   * - present: field-level validation error
   * - absent: general error (business/system)
   */
  field?: string

  /**
   * JSON Pointer (RFC 6901) pointing to the specific field (optional)
   * Example: /email, /address/city
   * Only used for field-level errors
   */
  pointer?: string

  /**
   * Machine-readable error code (UPPER_SNAKE_CASE)
   * Example: INVALID_EMAIL, EMAIL_EXISTS, USER_NOT_FOUND
   */
  code: string

  /**
   * Human-readable error message
   */
  message: string

  /**
   * Constraint details (optional)
   * Example: { min: 8, max: 100, provided: 5 }
   */
  constraints?: Record<string, unknown>

  /**
   * Expected format (optional)
   * Example: 'user@domain.com', 'YYYY-MM-DD'
   */
  expected_format?: string
}
