import { ApiProperty } from '@nestjs/swagger'

import { OffsetListResponseDto } from '@/shared-kernel/infrastructure/dtos/list-response.dto'

export class AuditLogResponseDto {
  id!: string

  action!: string

  actorId!: string | null

  actorEmail!: string | null

  resourceType!: string | null

  resourceId!: string | null

  detail!: unknown

  ipAddress!: string | null

  userAgent!: string | null

  requestId!: string | null

  createdAt!: Date
}

export class AuditLogListResponseDto extends OffsetListResponseDto<AuditLogResponseDto> {
  @ApiProperty({ type: () => AuditLogResponseDto, isArray: true })
  declare data: AuditLogResponseDto[]
}
