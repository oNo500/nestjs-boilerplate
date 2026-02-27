import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class LogoutDto {
  @ApiProperty({ description: 'Refresh Token' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh Token must not be empty' })
  refreshToken: string
}

export class LogoutResponseDto {
  @ApiProperty({ description: 'Whether the operation succeeded' })
  success: boolean

  @ApiProperty({ description: 'Response message' })
  message: string
}

export class LogoutAllResponseDto {
  @ApiProperty({ description: 'Number of sessions revoked' })
  revokedCount: number

  @ApiProperty({ description: 'Response message' })
  message: string
}
