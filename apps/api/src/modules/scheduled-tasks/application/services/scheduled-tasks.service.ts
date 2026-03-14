import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, Interval, Timeout } from '@nestjs/schedule'

import { AUTH_SESSION_REPOSITORY } from '@/modules/auth/application/ports/auth-session.repository.port'
import { CACHE_PORT } from '@/modules/cache/application/ports/cache.port'

import type { AuthSessionRepository } from '@/modules/auth/application/ports/auth-session.repository.port'
import type { CachePort } from '@/modules/cache/application/ports/cache.port'

const ANALYTICS_CACHE_KEYS = [
  'analytics:summary',
  'analytics:monthly-overview',
  'analytics:article-category-stats',
] as const

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name)

  constructor(
    @Inject(AUTH_SESSION_REPOSITORY)
    private readonly authSessionRepo: AuthSessionRepository,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  /**
   * Clean up expired sessions every hour.
   * This is a production-useful task that prevents the sessions table from growing unboundedly.
   */
  @Cron('0 * * * *')
  async cleanExpiredSessions(): Promise<void> {
    const deleted = await this.authSessionRepo.deleteExpired()
    this.logger.log(`Cleaned ${deleted} expired session(s)`)
  }

  /**
   * Heartbeat health check every 30 seconds.
   * Example of @Interval usage — checks application is alive.
   */
  @Interval(30_000)
  heartbeat(): void {
    this.logger.debug('Heartbeat: application is alive')
  }

  /**
   * One-time startup task that runs 5 seconds after application boot.
   * Example of @Timeout usage — suitable for deferred initialization work.
   */
  @Timeout(5000)
  onStartup(): void {
    this.logger.log('Startup task executed 5 seconds after boot')
  }

  /**
   * Invalidate analytics cache every day at 2 AM.
   * Demonstrates cache invalidation collaboration between modules:
   * AnalyticsService writes to cache → ScheduledTasksService clears it nightly.
   */
  @Cron('0 2 * * *')
  async invalidateAnalyticsCache(): Promise<void> {
    for (const key of ANALYTICS_CACHE_KEYS) {
      await this.cache.del(key)
    }
    this.logger.log('Analytics cache invalidated')
  }
}
