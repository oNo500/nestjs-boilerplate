import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, Interval, Timeout } from '@nestjs/schedule'

import { AUTH_SESSION_REPOSITORY } from '@/modules/auth/application/ports/auth-session.repository.port'

import type { AuthSessionRepository } from '@/modules/auth/application/ports/auth-session.repository.port'

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name)

  constructor(
    @Inject(AUTH_SESSION_REPOSITORY)
    private readonly authSessionRepo: AuthSessionRepository,
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
}
