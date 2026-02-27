/**
 * Aligns with the better-auth get-session response structure
 */
export class SessionUserDto {
  id: string

  email: string

  role: string | null
}

export class SessionInfoDto {
  id: string

  expiresAt: Date

  ipAddress: string | null

  userAgent: string | null
}

export class SessionResponseDto {
  user: SessionUserDto

  session: SessionInfoDto
}
