/**
 * API Error Handling
 *
 * Error handling implementation conforming to RFC 9457 Problem Details
 * https://www.rfc-editor.org/rfc/rfc9457
 */

/**
 * RFC 9457 Problem Details field-level error
 */
export interface FieldError {
  field?: string
  pointer?: string
  code: string
  message: string
  constraints?: Record<string, unknown>
  expected_format?: string
}

/**
 * RFC 9457 Problem Details response format
 */
export interface ProblemDetails {
  type: string
  title: string
  status: number
  instance?: string
  request_id?: string
  correlation_id?: string
  trace_id?: string
  timestamp?: string
  errors: FieldError[]
}

/**
 * API client error class
 *
 * Conforms to the RFC 9457 Problem Details specification
 */
export class ApiClientError extends Error {
  type: string
  title: string
  status: number
  instance?: string
  request_id?: string
  correlation_id?: string
  trace_id?: string
  timestamp?: string
  errors: FieldError[]

  constructor(problem: ProblemDetails) {
    super(problem.title)
    this.name = 'ApiClientError'
    this.type = problem.type
    this.title = problem.title
    this.status = problem.status
    this.instance = problem.instance
    this.request_id = problem.request_id
    this.correlation_id = problem.correlation_id
    this.trace_id = problem.trace_id
    this.timestamp = problem.timestamp
    this.errors = problem.errors
  }

  /**
   * Get the message of the first field error
   */
  getFirstFieldErrorMessage(): string | undefined {
    return this.errors[0]?.message
  }

  /**
   * Get the error message for a specific field
   */
  getFieldErrorMessage(field: string): string | undefined {
    return this.errors.find((e) => e.field === field)?.message
  }

  /**
   * Get a map of all field error messages
   */
  getFieldErrorMessages(): Record<string, string> {
    const messages: Record<string, string> = {}
    for (const error of this.errors) {
      if (error.field) {
        messages[error.field] = error.message
      }
    }
    return messages
  }
}

/**
 * Create a default ProblemDetails error
 */
export function createDefaultProblem(status: number, message: string): ProblemDetails {
  return {
    type: '/errors/client-error',
    title: message,
    status,
    errors: [],
  }
}
