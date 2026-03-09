import { ApiProperty } from '@nestjs/swagger'

import { OffsetListResponseDto } from '@/shared-kernel/infrastructure/dtos/list-response.dto'

/**
 * Adapted to better-auth schema:
 * - single-role system
 * - banned boolean replaces a status enum
 */
export class UserResponseDto {
  @ApiProperty({ example: 'usr_01HXYZ' })
  id: string

  @ApiProperty({ example: 'John Doe' })
  name: string

  @ApiProperty({ type: String, example: 'Johnny', nullable: true })
  displayName: string | null

  @ApiProperty({ example: 'user@example.com' })
  email: string

  @ApiProperty({ example: true })
  emailVerified: boolean

  @ApiProperty({ type: String, example: 'https://example.com/avatar.png', nullable: true })
  image: string | null

  @ApiProperty({ type: String, example: 'user', nullable: true })
  role: string | null

  @ApiProperty({ example: false })
  banned: boolean

  @ApiProperty({ type: String, example: null, nullable: true })
  banReason: string | null

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date
}

export class UserListResponseDto extends OffsetListResponseDto<UserResponseDto> {
  @ApiProperty({ type: () => UserResponseDto, isArray: true })
  declare data: UserResponseDto[]
}
