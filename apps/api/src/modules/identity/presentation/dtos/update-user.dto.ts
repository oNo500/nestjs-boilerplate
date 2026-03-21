import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import {
  IsBooleanField,
  IsStringField,
  MaxLengthField,
  MinLengthField,
} from '@/shared-kernel/infrastructure/decorators/validators'

/**
 * Adapted to better-auth schema:
 * - role changes go through the dedicated endpoint PUT /users/:id/role
 * - banned boolean replaces status
 * - email cannot be changed (authentication identity)
 */
export class UpdateUserDto {
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

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBooleanField()
  banned?: boolean

  @ApiPropertyOptional({ example: 'Violated terms of service' })
  @IsOptional()
  @IsStringField()
  @MaxLengthField(500)
  banReason?: string
}
