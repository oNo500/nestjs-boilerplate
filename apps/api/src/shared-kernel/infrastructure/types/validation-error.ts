/**
 * Class-validator error type definitions
 */
export interface ValidationErrorItem {
  property: string
  constraints?: Record<string, string>
  children?: ValidationErrorItem[]
}

/**
 * Express Response extension type
 */
export interface TypedResponse {
  statusCode: number
  get(name: string): string | undefined
}
