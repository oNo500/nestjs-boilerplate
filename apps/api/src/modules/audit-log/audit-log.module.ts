import { Global, Module } from '@nestjs/common'

import { AUDIT_LOG_REPOSITORY } from '@/modules/audit-log/application/ports/audit-log.repository.port'
import { AuditLogService } from '@/modules/audit-log/application/services/audit-log.service'
import { AuditLogRepositoryImpl } from '@/modules/audit-log/infrastructure/repositories/audit-log.repository'
import { AuditLogController } from '@/modules/audit-log/presentation/controllers/audit-log.controller'
import { AUDIT_LOGGER } from '@/shared-kernel/infrastructure/audit/audit-logger.port'

@Global()
@Module({
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    {
      provide: AUDIT_LOG_REPOSITORY,
      useClass: AuditLogRepositoryImpl,
    },
    {
      provide: AUDIT_LOGGER,
      useExisting: AuditLogService,
    },
  ],
  exports: [AuditLogService, AUDIT_LOGGER],
})
export class AuditLogModule {}
