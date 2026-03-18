import { Module } from '@nestjs/common'

import { AuthModule } from '@/modules/auth/auth.module'
import { CacheModule } from '@/modules/cache/cache.module'
import { ScheduledTasksService } from '@/modules/scheduled-tasks/application/services/scheduled-tasks.service'

@Module({
  imports: [AuthModule, CacheModule],
  providers: [ScheduledTasksService],
})
export class ScheduledTasksModule {}
