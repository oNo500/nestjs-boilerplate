import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsUrl } from 'class-validator'

import {
  IsStringField,
  MaxLengthField,
} from '@/shared-kernel/infrastructure/decorators/validators'

export class ProfileResponseDto {
  @ApiProperty({ example: 'usr_01HXYZ' })
  id: string

  @ApiProperty({ example: 'john@example.com' })
  email: string

  @ApiProperty({ example: 'John Doe' })
  name: string

  @ApiProperty({ type: String, example: 'Johnny', nullable: true })
  displayName: string | null

  @ApiProperty({ type: String, example: 'Software engineer and open source enthusiast.', nullable: true })
  bio: string | null

  @ApiProperty({ type: String, example: 'https://example.com/avatar.png', nullable: true })
  avatarUrl: string | null
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ type: String, example: 'Johnny', nullable: true })
  @IsOptional()
  @IsStringField()
  @MaxLengthField(50)
  displayName?: string | null

  @ApiPropertyOptional({ type: String, example: 'Software engineer and open source enthusiast.', nullable: true })
  @IsOptional()
  @IsStringField()
  @MaxLengthField(500)
  bio?: string | null

  @ApiPropertyOptional({ type: String, example: 'https://example.com/avatar.png', nullable: true })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string | null
}
