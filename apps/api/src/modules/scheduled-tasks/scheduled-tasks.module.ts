import { Module } from '@nestjs/common'

import { AUTH_SESSION_REPOSITORY } from '@/modules/auth/application/ports/auth-session.repository.port'
import { AuthSessionRepositoryImpl } from '@/modules/auth/infrastructure/repositories/auth-session.repository'
import { ScheduledTasksService } from '@/modules/scheduled-tasks/application/services/scheduled-tasks.service'

@Module({
  providers: [
    ScheduledTasksService,
    {
      provide: AUTH_SESSION_REPOSITORY,
      useClass: AuthSessionRepositoryImpl,
    },
  ],
})
export class ScheduledTasksModule {}
