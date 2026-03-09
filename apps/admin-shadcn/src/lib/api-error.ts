/**
 * RFC 9457 Problem Details — https://www.rfc-editor.org/rfc/rfc9457
 *
 * Backend error shape:
 * - Business errors:   { type, title, status, code, detail }
 * - Validation errors: { type, title, status, code, detail, errors[] }
 */

export interface FieldError {
  field?: string
  code: string
  message: string
}

export class ApiClientError extends Error {
  readonly status: number
  readonly code?: string
  /** Human-readable message for this specific occurrence (detail ?? title) */
  readonly userMessage: string
  /** Field-level errors, present only for validation failures */
  readonly errors: FieldError[]

  constructor(raw: {
    title: string
    status: number
    code?: string
    detail?: string
    errors?: FieldError[]
  }) {
    const userMessage = raw.detail ?? raw.title
    super(userMessage)
    this.name = 'ApiClientError'
    this.status = raw.status
    this.code = raw.code
    this.userMessage = userMessage
    this.errors = raw.errors ?? []
  }
}
