import { ApiProperty } from '@nestjs/swagger'

import { OffsetListResponseDto } from '@/shared-kernel/infrastructure/dtos/list-response.dto'

/**
 * Adapted to better-auth schema:
 * - single-role system
 * - banned boolean replaces a status enum
 */
export class UserResponseDto {
  id: string

  name: string

  displayName: string | null

  email: string

  emailVerified: boolean

  image: string | null

  role: string | null

  banned: boolean

  banReason: string | null

  createdAt: Date

  updatedAt: Date
}

export class UserListResponseDto extends OffsetListResponseDto<UserResponseDto> {
  @ApiProperty({ type: () => UserResponseDto, isArray: true })
  declare data: UserResponseDto[]
}
