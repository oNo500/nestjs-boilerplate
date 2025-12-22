/**
 * User info in session
 */
export class SessionUserDto {
  /** User ID */
  id: string

  /** User email */
  email: string

  /** User role */
  role: string | null
}

/**
 * Session info
 */
export class SessionInfoDto {
  /** Session ID */
  id: string

  /** Expiration time */
  expiresAt: Date

  /** IP address */
  ipAddress: string | null

  /** User agent */
  userAgent: string | null
}

/**
 * Get current session response DTO
 *
 * Aligned with better-auth get-session response structure
 */
export class SessionResponseDto {
  /** User info */
  user: SessionUserDto

  /** Session info */
  session: SessionInfoDto
}
