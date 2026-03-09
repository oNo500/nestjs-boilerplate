import { ApiProperty } from '@nestjs/swagger'

export class LoginLogItemDto {
  @ApiProperty()
  id: string

  @ApiProperty({ type: String, nullable: true })
  userId: string | null

  @ApiProperty()
  email: string

  @ApiProperty({ enum: ['success', 'failed'] })
  status: 'success' | 'failed'

  @ApiProperty({ type: String, nullable: true })
  ipAddress: string | null

  @ApiProperty({ type: String, nullable: true })
  userAgent: string | null

  @ApiProperty({ type: String, nullable: true })
  failReason: string | null

  @ApiProperty()
  createdAt: Date
}

export class LoginLogListResponseDto {
  @ApiProperty({ enum: ['list'] })
  object: 'list'

  @ApiProperty({ type: [LoginLogItemDto] })
  data: LoginLogItemDto[]

  @ApiProperty()
  total: number

  @ApiProperty()
  page: number

  @ApiProperty()
  pageSize: number

  @ApiProperty()
  hasMore: boolean
}
