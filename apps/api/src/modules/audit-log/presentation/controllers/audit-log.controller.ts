import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AuditLogService } from '@/modules/audit-log/application/services/audit-log.service'
import { AuditLogQueryDto } from '@/modules/audit-log/presentation/dtos/audit-log-query.dto'
import { AuditLogListResponseDto } from '@/modules/audit-log/presentation/dtos/audit-log-response.dto'
import { Roles } from '@/shared-kernel/infrastructure/decorators/roles.decorator'
import { UseEnvelope } from '@/shared-kernel/infrastructure/decorators/use-envelope.decorator'

@ApiTags('Audit Logs')
@Controller('audit-logs')
@Roles('ADMIN')
@ApiBearerAuth()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseEnvelope()
  @ApiOperation({ summary: 'Query audit log list' })
  @ApiResponse({ status: 200, type: AuditLogListResponseDto })
  async findAll(@Query() query: AuditLogQueryDto): Promise<AuditLogListResponseDto> {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 20

    const result = await this.auditLogService.findAll({
      page,
      pageSize,
      actorId: query.actorId,
      action: query.action,
    })

    const totalPages = Math.ceil(result.total / pageSize)

    return {
      object: 'list',
      data: result.data,
      total: result.total,
      page,
      pageSize,
      hasMore: page < totalPages,
    }
  }
}
