import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsUUID } from 'class-validator'

export class RevokeSessionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  sessionId: string
}

export class RevokeSessionResponseDto {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({ example: 'Session revoked successfully' })
  message: string
}
