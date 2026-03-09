import { ApiProperty } from '@nestjs/swagger'

import { OffsetListResponseDto } from '@/shared-kernel/infrastructure/dtos/list-response.dto'

export class AuditLogResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  action!: string

  @ApiProperty({ type: String, nullable: true })
  actorId!: string | null

  @ApiProperty({ type: String, nullable: true })
  actorEmail!: string | null

  @ApiProperty({ type: String, nullable: true })
  resourceType!: string | null

  @ApiProperty({ type: String, nullable: true })
  resourceId!: string | null

  @ApiProperty({ type: Object })
  detail!: unknown

  @ApiProperty({ type: String, nullable: true })
  ipAddress!: string | null

  @ApiProperty({ type: String, nullable: true })
  userAgent!: string | null

  @ApiProperty({ type: String, nullable: true })
  requestId!: string | null

  @ApiProperty()
  createdAt!: Date
}

export class AuditLogListResponseDto extends OffsetListResponseDto<AuditLogResponseDto> {
  @ApiProperty({ type: () => AuditLogResponseDto, isArray: true })
  declare data: AuditLogResponseDto[]
}
