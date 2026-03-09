import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

import { UserInfo } from './login.dto'

export class RefreshTokenDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Refresh token returned at login',
  })
  @IsString()
  @IsNotEmpty({ message: 'Refresh Token must not be empty' })
  refreshToken: string
}

export class RefreshTokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...' })
  accessToken: string

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  refreshToken: string

  @ApiProperty({ type: () => UserInfo })
  user: UserInfo
}

export { UserInfo } from './login.dto'
