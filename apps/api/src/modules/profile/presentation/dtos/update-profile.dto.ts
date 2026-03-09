import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsUrl, MaxLength, IsObject, IsIn, IsBoolean } from 'class-validator'

class UpdatePreferencesDto {
  @ApiPropertyOptional({ enum: ['light', 'dark', 'system'] })
  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: 'light' | 'dark' | 'system'

  @ApiPropertyOptional({ example: 'zh-CN' })
  @IsOptional()
  @IsString()
  lang?: string

  @ApiPropertyOptional({ example: 'Asia/Shanghai' })
  @IsOptional()
  @IsString()
  timezone?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  notifications?: boolean
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string | null

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string | null

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string | null

  @ApiPropertyOptional({ type: UpdatePreferencesDto })
  @IsOptional()
  @IsObject()
  preferences?: UpdatePreferencesDto
}
