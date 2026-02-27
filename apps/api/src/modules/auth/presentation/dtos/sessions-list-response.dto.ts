/**
 * Aligns with the better-auth list-sessions response structure
 */
export class SessionItemDto {
  id: string

  createdAt: Date

  expiresAt: Date

  ipAddress: string | null

  userAgent: string | null

  isCurrent: boolean
}

export class SessionsListResponseDto {
  sessions: SessionItemDto[]
}
