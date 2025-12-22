import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'

import { DrizzleHealthIndicator } from '@/app/health/drizzle.health'
import { HealthController } from '@/app/health/health.controller'

/**
 * Health check module - database, memory, and disk checks
 * Database connection provided by global DrizzleModule
 */
@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [DrizzleHealthIndicator],
})
export class HealthModule {}
