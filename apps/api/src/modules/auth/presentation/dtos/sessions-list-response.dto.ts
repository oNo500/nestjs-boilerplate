import { ApiProperty } from '@nestjs/swagger'

/**
 * Aligns with the better-auth list-sessions response structure
 */
export class SessionItemDto {
  @ApiProperty({ example: 'ses_01HXYZ' })
  id: string

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  expiresAt: Date

  @ApiProperty({ type: String, example: '127.0.0.1', nullable: true })
  ipAddress: string | null

  @ApiProperty({ type: String, example: 'Mozilla/5.0', nullable: true })
  userAgent: string | null

  @ApiProperty({ example: false })
  isCurrent: boolean
}

export class SessionsListResponseDto {
  @ApiProperty({ type: () => SessionItemDto, isArray: true })
  sessions: SessionItemDto[]
}
