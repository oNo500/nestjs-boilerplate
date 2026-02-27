import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'

import { DrizzleHealthIndicator } from '@/app/health/drizzle.health'
import { HealthController } from '@/app/health/health.controller'
import { RedisHealthIndicator } from '@/app/health/redis.health'
import { CacheModule } from '@/modules/cache/cache.module'

/**
 * Health check module
 *
 * Provides application health check functionality including database, Redis, memory, and disk checks.
 * Note: the database connection is provided by the global DrizzleModule.
 */
@Module({
  imports: [
    TerminusModule, // Terminus health check core module
    CacheModule, // provides CACHE_PORT (required by Redis health check)
  ],
  controllers: [HealthController],
  providers: [
    DrizzleHealthIndicator, // database health indicator
    RedisHealthIndicator, // Redis health indicator
  ],
})
export class HealthModule {}
