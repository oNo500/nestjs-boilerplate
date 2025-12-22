import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * RFC 9457 Problem Details standard error response
 *
 * Spec: https://www.rfc-editor.org/rfc/rfc9457.html
 *
 * Core fields (RFC 9457):
 * - type: Problem type URI (should dereference to documentation)
 * - title: Short, human-readable summary
 * - status: HTTP status code
 * - detail: Detailed explanation specific to this occurrence
 * - instance: URI reference where problem occurred
 *
 * Extension fields (application-specific):
 * - request_id: Request tracking ID
 * - correlation_id: Correlation ID (cross-service tracing)
 * - trace_id: Distributed trace ID
 * - timestamp: Error timestamp
 * - errors: Field-level errors (for validation errors)
 */
export class ProblemDetailsDto {
  @ApiProperty({
    description: 'Problem type URI (should dereference to human-readable docs)',
    example: 'https://api.example.com/errors/validation-failed',
  })
  type: string

  @ApiProperty({
    description: 'Short, human-readable summary',
    example: 'Request validation failed',
  })
  title: string

  @ApiProperty({
    description: 'HTTP status code',
    example: 422,
  })
  status: number

  @ApiPropertyOptional({
    description: 'Detailed explanation specific to this occurrence',
    example: 'Submitted data failed business rule validation',
  })
  detail?: string

  @ApiPropertyOptional({
    description: 'URI reference where problem occurred',
    example: '/api/users',
  })
  instance?: string

  // ========== Extension fields (application-specific) ==========

  @ApiPropertyOptional({
    description: 'Request tracking ID',
    example: 'req_xyz789',
  })
  request_id?: string

  @ApiPropertyOptional({
    description: 'Correlation ID (business transaction tracking)',
    example: 'corr_shop_session_abc123',
  })
  correlation_id?: string

  @ApiPropertyOptional({
    description: 'Distributed trace ID (W3C Trace Context)',
    example: '4bf92f3577b34da6a3ce929d0e0e4736',
  })
  trace_id?: string

  @ApiPropertyOptional({
    description: 'Error timestamp (ISO 8601 format)',
    example: '2024-11-03T10:30:00Z',
  })
  timestamp?: string

  // ========== Validation error extensions ==========

  @ApiPropertyOptional({
    description: 'Field-level errors (for validation errors)',
    type: [Object],
    example: [
      {
        field: 'email',
        pointer: '/email',
        code: 'INVALID_FORMAT',
        message: 'Invalid email format',
        expected_format: 'user@domain.com',
      },
    ],
  })
  errors?: FieldError[]
}

/**
 * Field-level error details
 *
 * Spec references:
 * - JSON Pointer (RFC 6901): https://www.rfc-editor.org/rfc/rfc6901.html
 * - Google AIP-193 Error Model: https://google.aip.dev/193
 */
export interface FieldError {
  /**
   * Field name
   */
  field: string

  /**
   * JSON Pointer (RFC 6901) to specific field
   * e.g., /email, /address/city
   */
  pointer: string

  /**
   * Machine-readable error code (UPPER_SNAKE_CASE)
   * e.g., INVALID_FORMAT, REQUIRED_FIELD, TOO_SHORT
   */
  code: string

  /**
   * Human-readable error message
   */
  message: string

  /**
   * Constraint details (optional)
   * e.g., { min: 8, max: 100, provided: 5 }
   */
  constraints?: Record<string, unknown>

  /**
   * Expected format (optional)
   * e.g., 'user@domain.com', 'YYYY-MM-DD'
   */
  expected_format?: string
}
