/**
 * Session list item
 */
export class SessionItemDto {
  /** Session ID */
  id: string

  /** Creation time */
  createdAt: Date

  /** Expiration time */
  expiresAt: Date

  /** IP address */
  ipAddress: string | null

  /** User agent */
  userAgent: string | null

  /** Is current session */
  isCurrent: boolean
}

/**
 * Sessions list response DTO
 *
 * Aligned with better-auth list-sessions response structure
 */
export class SessionsListResponseDto {
  /** Sessions list */
  sessions: SessionItemDto[]
}
