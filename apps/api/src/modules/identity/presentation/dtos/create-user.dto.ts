import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { ROLES } from '@/shared-kernel/domain/value-objects/role.vo'
import {
  IsEmailField,
  IsInField,
  IsStringField,
  MaxLengthField,
  MinLengthField,
} from '@/shared-kernel/infrastructure/decorators/validators'

/**
 * Adapted to better-auth schema: single-role system, banned boolean replaces status (defaults to false on creation)
 */
export class CreateUserDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsStringField()
  @MinLengthField(1)
  @MaxLengthField(50)
  name?: string

  @ApiPropertyOptional({ example: 'Johnny' })
  @IsOptional()
  @IsStringField()
  @MinLengthField(1)
  @MaxLengthField(50)
  displayName?: string

  @ApiProperty({ example: 'user@example.com' })
  @IsEmailField()
  email: string

  @ApiProperty({ example: 'Pass123456' })
  @IsStringField()
  @MinLengthField(6)
  password: string

  @ApiPropertyOptional({ example: 'user', enum: Object.values(ROLES) })
  @IsOptional()
  @IsInField(Object.values(ROLES))
  role?: string
}
