import { Module } from '@nestjs/common'

import { ANALYTICS_REPOSITORY } from '@/modules/analytics/application/ports/analytics.repository.port'
import { AnalyticsService } from '@/modules/analytics/application/services/analytics.service'
import { AnalyticsRepositoryImpl } from '@/modules/analytics/infrastructure/repositories/analytics.repository'
import { AnalyticsController } from '@/modules/analytics/presentation/controllers/analytics.controller'
import { CacheModule } from '@/modules/cache/cache.module'

@Module({
  imports: [CacheModule],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    {
      provide: ANALYTICS_REPOSITORY,
      useClass: AnalyticsRepositoryImpl,
    },
  ],
})
export class AnalyticsModule {}
