import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

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
export class FieldError {
  @ApiPropertyOptional({
    description: 'Field name (field-level validation error when present)',
    example: 'email',
  })
  field?: string

  @ApiPropertyOptional({
    description: 'JSON Pointer (RFC 6901) to the specific field',
    example: '/email',
  })
  pointer?: string

  @ApiProperty({
    description: 'Machine-readable error code (UPPER_SNAKE_CASE)',
    example: 'INVALID_EMAIL',
  })
  code: string

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'email must be a valid email address',
  })
  message: string

  @ApiPropertyOptional({
    description: 'Constraint details',
    example: { min: 8, max: 100, provided: 5 },
  })
  constraints?: Record<string, unknown>

  @ApiPropertyOptional({
    description: 'Expected format',
    example: 'user@domain.com',
  })
  expected_format?: string
}

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
 * - code: machine-readable error code (business errors)
 * - detail: human-readable description of this specific occurrence (business errors)
 * - errors: field-level error details array (validation errors only)
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

  // ========== Business error fields ==========

  @ApiPropertyOptional({
    description: 'Machine-readable error code (business errors only)',
    example: 'INVALID_CREDENTIALS',
  })
  code?: string

  @ApiPropertyOptional({
    description: 'Human-readable detail for this specific request occurrence',
    example: 'Invalid email or password',
  })
  detail?: string

  // ========== Validation error details (validation errors only) ==========

  @ApiPropertyOptional({
    description: 'Field-level error details (validation errors only; absent for business/system errors)',
    type: [FieldError],
    example: [
      {
        field: 'email',
        pointer: '/email',
        code: 'INVALID_EMAIL',
        message: 'email must be a valid email address',
      },
    ],
  })
  errors?: FieldError[]
}
