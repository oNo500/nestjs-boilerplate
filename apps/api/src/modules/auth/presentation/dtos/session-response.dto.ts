import { ApiProperty } from '@nestjs/swagger'

import { ROLES } from '@/shared-kernel/domain/value-objects/role.vo'

import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'

/**
 * Aligns with the better-auth get-session response structure
 */
export class SessionUserDto {
  @ApiProperty({ example: 'usr_01HXYZ' })
  id: string

  @ApiProperty({ example: 'user@example.com' })
  email: string

  @ApiProperty({ enum: Object.values(ROLES), example: 'USER' })
  role: RoleType
}

export class SessionInfoDto {
  @ApiProperty({ example: 'ses_01HXYZ' })
  id: string

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  expiresAt: Date

  @ApiProperty({ type: String, example: '127.0.0.1', nullable: true })
  ipAddress: string | null

  @ApiProperty({ type: String, example: 'Mozilla/5.0', nullable: true })
  userAgent: string | null
}

export class SessionResponseDto {
  @ApiProperty({ type: () => SessionUserDto })
  user: SessionUserDto

  @ApiProperty({ type: () => SessionInfoDto })
  session: SessionInfoDto
}
