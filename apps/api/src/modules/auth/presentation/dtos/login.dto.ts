import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

/**
 * Login request DTO
 */
export class LoginDto {
  /**
   * Email address
   * @example user@example.com
   */
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string

  /**
   * Password
   * @example Pass123456
   */
  @ApiProperty({ example: 'Pass123456' })
  @IsString()
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string
}

/**
 * User info
 */
export class UserInfo {
  /** User ID */
  id: string

  /** User email */
  email: string

  /** User role */
  role: string | null
}

/**
 * Login response DTO
 */
export class LoginResponseDto {
  /** Access Token for authentication */
  accessToken: string

  /** Refresh Token for refreshing Access Token */
  refreshToken: string

  /** User basic info */
  user: UserInfo
}
