import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'

import { DrizzleHealthIndicator } from '@/modules/health/infrastructure/drizzle.health'
import { RedisHealthIndicator } from '@/modules/health/infrastructure/redis.health'
import { HealthController } from '@/modules/health/presentation/controllers/health.controller'

/**
 * Health check module
 *
 * Provides application health check functionality including database, Redis, memory, and disk checks.
 * Note: DB and Cache are provided by global modules (DrizzleModule, CacheModule).
 */
@Module({
  imports: [
    TerminusModule,
  ],
  controllers: [HealthController],
  providers: [
    DrizzleHealthIndicator, // database health indicator
    RedisHealthIndicator, // Redis health indicator
  ],
})
export class HealthModule {}
