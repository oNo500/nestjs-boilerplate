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
  id: string

  email: string

  role: string | null
}

export class LoginResponseDto {
  accessToken: string

  refreshToken: string

  user: UserInfo
}
