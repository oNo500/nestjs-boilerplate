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
  @IsOptional()
  @IsStringField()
  @MinLengthField(1)
  @MaxLengthField(50)
  name?: string

  @IsOptional()
  @IsStringField()
  @MinLengthField(1)
  @MaxLengthField(50)
  displayName?: string

  @IsEmailField()
  email: string

  @IsStringField()
  @MinLengthField(6)
  password: string

  @IsOptional()
  @IsInField(Object.values(ROLES))
  role?: string
}
