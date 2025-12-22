import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

/**
 * Logout request DTO
 */
export class LogoutDto {
  /**
   * Refresh Token
   * Specifies the session to revoke
   */
  @ApiProperty({ description: 'Refresh Token' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh Token cannot be empty' })
  refreshToken: string
}

/**
 * Logout response DTO
 */
export class LogoutResponseDto {
  /**
   * Success status
   */
  @ApiProperty({ description: 'Success status' })
  success: boolean

  /**
   * Message
   */
  @ApiProperty({ description: 'Message' })
  message: string
}

/**
 * Logout all devices response DTO
 */
export class LogoutAllResponseDto {
  /**
   * Number of revoked sessions
   */
  @ApiProperty({ description: 'Number of revoked sessions' })
  revokedCount: number

  /**
   * Message
   */
  @ApiProperty({ description: 'Message' })
  message: string
}
