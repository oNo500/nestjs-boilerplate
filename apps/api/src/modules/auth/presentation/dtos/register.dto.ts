import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator'

/**
 * Register request DTO
 *
 * Compatible with better-auth schema
 */
export class RegisterDto {
  /**
   * Email address
   * @example user@example.com
   */
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string

  /**
   * Username (3-30 characters, letters, numbers, underscore and hyphen only)
   * @example john_doe
   */
  @ApiProperty({ example: 'john_doe' })
  @IsString()
  @IsNotEmpty({ message: 'Username cannot be empty' })
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(30, { message: 'Username must be at most 30 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username can only contain letters, numbers, underscore and hyphen',
  })
  name: string

  /**
   * Password (at least 8 characters, must contain letters and numbers)
   * @example Pass123456
   */
  @ApiProperty({ example: 'Pass123456' })
  @IsString()
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100, { message: 'Password must be at most 100 characters' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string
}

/**
 * Register response DTO (reuses login response)
 */
export { LoginResponseDto as RegisterResponseDto, UserInfo } from './login.dto'
