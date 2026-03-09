import { ApiProperty } from '@nestjs/swagger'

import {
  IsEmailField,
  IsNotEmptyField,
  IsStringField,
} from '@/shared-kernel/infrastructure/decorators/validators'

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmailField({ message: 'Invalid email format' })
  email: string

  @ApiProperty({ example: 'Pass123456' })
  @IsStringField()
  @IsNotEmptyField({ message: 'Password must not be empty' })
  password: string
}

export class UserInfo {
  @ApiProperty({ example: 'usr_01HXYZ' })
  id: string

  @ApiProperty({ example: 'user@example.com' })
  email: string

  @ApiProperty({ type: String, example: 'user', nullable: true })
  role: string | null
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...' })
  accessToken: string

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  refreshToken: string

  @ApiProperty({ type: () => UserInfo })
  user: UserInfo
}
