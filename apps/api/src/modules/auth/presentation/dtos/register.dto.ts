import { ApiProperty } from '@nestjs/swagger'

import {
  IsEmailField,
  IsNotEmptyField,
  IsStringField,
  MatchesField,
  MaxLengthField,
  MinLengthField,
} from '@/shared-kernel/infrastructure/decorators/validators'

/**
 * Adapts better-auth schema
 */
export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmailField({ message: 'Invalid email format' })
  email: string

  /**
   * 3-30 characters; only letters, digits, underscores, and hyphens allowed
   */
  @ApiProperty({ example: 'john_doe' })
  @IsStringField()
  @IsNotEmptyField({ message: 'Username must not be empty' })
  @MinLengthField(3, { message: 'Username must be at least 3 characters long' })
  @MaxLengthField(30, { message: 'Username must not exceed 30 characters' })
  @MatchesField(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username may only contain letters, digits, underscores, and hyphens',
  })
  name: string

  /**
   * At least 8 characters; must contain both letters and digits
   */
  @ApiProperty({ example: 'Pass123456' })
  @IsStringField()
  @IsNotEmptyField({ message: 'Password must not be empty' })
  @MinLengthField(8, { message: 'Password must be at least 8 characters long' })
  @MaxLengthField(100, { message: 'Password must not exceed 100 characters' })
  @MatchesField(/^(?=.*[a-zA-Z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one digit',
  })
  password: string
}

export { LoginResponseDto as RegisterResponseDto, UserInfo } from './login.dto'
