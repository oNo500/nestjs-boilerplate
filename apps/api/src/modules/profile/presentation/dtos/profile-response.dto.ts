import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UserPreferencesDto {
  @ApiPropertyOptional({ enum: ['light', 'dark', 'system'] })
  theme?: 'light' | 'dark' | 'system'

  @ApiPropertyOptional()
  lang?: string

  @ApiPropertyOptional()
  timezone?: string

  @ApiPropertyOptional()
  notifications?: boolean
}

export class ProfileResponseDto {
  @ApiProperty()
  userId: string

  @ApiPropertyOptional({ type: String, nullable: true })
  displayName: string | null

  @ApiPropertyOptional({ type: String, nullable: true })
  avatarUrl: string | null

  @ApiPropertyOptional({ type: String, nullable: true })
  bio: string | null

  @ApiProperty({ type: UserPreferencesDto })
  preferences: UserPreferencesDto

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
