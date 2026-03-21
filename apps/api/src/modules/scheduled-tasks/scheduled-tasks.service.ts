import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, Interval, Timeout } from '@nestjs/schedule'

import { SESSION_CLEANUP_PORT } from '@/modules/auth/application/ports/session-cleanup.port'

import type { SessionCleanupPort } from '@/modules/auth/application/ports/session-cleanup.port'

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name)

  constructor(
    @Inject(SESSION_CLEANUP_PORT)
    private readonly sessionCleanup: SessionCleanupPort,
  ) {}

  @Cron('0 * * * *')
  async cleanExpiredSessions(): Promise<void> {
    const deleted = await this.sessionCleanup.deleteExpired()
    this.logger.log(`Cleaned ${deleted} expired session(s)`)
  }

  @Interval(30_000)
  heartbeat(): void {
    this.logger.debug('Heartbeat: application is alive')
  }

  @Timeout(5000)
  onStartup(): void {
    this.logger.log('Startup task executed 5 seconds after boot')
  }
}
