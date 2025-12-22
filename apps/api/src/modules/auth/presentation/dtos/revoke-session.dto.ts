import { IsNotEmpty, IsUUID } from 'class-validator'

/**
 * Revoke session request DTO
 */
export class RevokeSessionDto {
  /**
   * Session ID to revoke
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @IsUUID()
  @IsNotEmpty()
  sessionId: string
}

/**
 * Revoke session response DTO
 */
export class RevokeSessionResponseDto {
  /** Success status */
  success: boolean

  /** Message */
  message: string
}
