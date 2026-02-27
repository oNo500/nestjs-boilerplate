import { Module } from '@nestjs/common'

import { DashboardService } from '@/modules/dashboard/application/services/dashboard.service'
import { DashboardController } from '@/modules/dashboard/presentation/controllers/dashboard.controller'

/**
 * Dashboard module
 *
 * Provides dashboard statistics query functionality
 * Uses an anemic model with no domain layer
 */
@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
