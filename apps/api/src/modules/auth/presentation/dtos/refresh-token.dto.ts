import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

import type { UserInfo } from './login.dto'

export class RefreshTokenDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Refresh token returned at login',
  })
  @IsString()
  @IsNotEmpty({ message: 'Refresh Token must not be empty' })
  @IsUUID('4', { message: 'Refresh Token has an invalid format' })
  refreshToken: string
}

export class RefreshTokenResponseDto {
  accessToken: string

  refreshToken: string

  user: UserInfo
}

export { UserInfo } from './login.dto'
