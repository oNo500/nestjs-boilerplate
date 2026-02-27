/**
 * class-validator validation error type definitions
 */
export interface ValidationErrorItem {
  property: string
  constraints?: Record<string, string>
  /**
   * Per-constraint context injected via { context: { code: '...' } }
   */
  contexts?: Record<string, { code?: string } | undefined>
  children?: ValidationErrorItem[]
}

/**
 * Extended Express Response type
 */
export interface TypedResponse {
  statusCode: number
  get(name: string): string | undefined
}
