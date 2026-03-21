import { Inject, Injectable, Logger } from '@nestjs/common'
import { ClsService } from 'nestjs-cls'

import { AUDIT_LOG_REPOSITORY } from '@/modules/audit-log/application/ports/audit-log.repository.port'

import type { AuditLogListQuery, AuditLogListResult, AuditLogRepository } from '@/modules/audit-log/application/ports/audit-log.repository.port'
import type { AuditLogInput } from '@/shared-kernel/application/ports/audit-logger.port'

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name)

  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly repo: AuditLogRepository,
    private readonly cls: ClsService,
  ) {}

  async log(data: AuditLogInput): Promise<void> {
    try {
      await this.repo.create({
        ...data,
        ipAddress: this.cls.get<string>('ip'),
        userAgent: this.cls.get<string>('userAgent'),
        requestId: this.cls.getId(),
      })
    } catch (error) {
      this.logger.error('Audit log write failed', error)
    }
  }

  async findAll(query: AuditLogListQuery): Promise<AuditLogListResult> {
    return this.repo.findAll(query)
  }
}
