import { Injectable, Inject } from '@nestjs/common'

import { CACHE_PORT } from '@/shared-kernel/application/ports/cache.port'

import type { CachePort } from '@/shared-kernel/application/ports/cache.port'
import type { HealthIndicatorResult } from '@nestjs/terminus'

/** Temporary key for the health probe; TTL is set to 5 seconds */
const PROBE_KEY = '__health_probe__'

/**
 * Redis health indicator
 *
 * Verifies the Redis connection by writing and reading back a temporary key
 */
@Injectable()
export class RedisHealthIndicator {
  constructor(@Inject(CACHE_PORT) private readonly cache: CachePort) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.cache.set(PROBE_KEY, '1', 5)
      await this.cache.get(PROBE_KEY)

      return {
        [key]: {
          status: 'up' as const,
          message: 'Redis is available',
        },
      }
    } catch (error) {
      return {
        [key]: {
          status: 'down' as const,
          message: error instanceof Error ? error.message : 'Redis check failed',
        },
      }
    }
  }
}
