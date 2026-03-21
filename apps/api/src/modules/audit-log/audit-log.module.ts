import { Global, Module } from '@nestjs/common'

import { AuthAuditListener } from '@/modules/audit-log/application/listeners/auth-audit.listener'
import { IdentityAuditListener } from '@/modules/audit-log/application/listeners/identity-audit.listener'
import { AUDIT_LOG_REPOSITORY } from '@/modules/audit-log/application/ports/audit-log.repository.port'
import { AuditLogService } from '@/modules/audit-log/application/services/audit-log.service'
import { AuditLogRepositoryImpl } from '@/modules/audit-log/infrastructure/repositories/audit-log.repository'
import { AuditLogController } from '@/modules/audit-log/presentation/controllers/audit-log.controller'
import { AUDIT_LOGGER } from '@/shared-kernel/application/ports/audit-logger.port'

@Global() // @global-approved: 审计日志横切关注点，所有写操作的 context 都依赖
@Module({
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    AuthAuditListener,
    IdentityAuditListener,
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
