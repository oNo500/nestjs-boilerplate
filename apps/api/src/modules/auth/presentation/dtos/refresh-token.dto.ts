import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

import type { UserInfo } from './login.dto'

/**
 * Refresh token request DTO
 */
export class RefreshTokenDto {
  /**
   * Refresh Token
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Refresh Token returned from login',
  })
  @IsString()
  @IsNotEmpty({ message: 'Refresh Token cannot be empty' })
  @IsUUID('4', { message: 'Invalid Refresh Token format' })
  refreshToken: string
}

/**
 * Refresh token response DTO
 */
export class RefreshTokenResponseDto {
  /** Access Token for authentication */
  accessToken: string

  /** Refresh Token for refreshing Access Token */
  refreshToken: string

  /** User basic info */
  user: UserInfo
}

/**
 * Export UserInfo type for use in other modules
 */
export { UserInfo } from './login.dto'
