import { Injectable, Inject } from '@nestjs/common'
import { sql } from 'drizzle-orm'

import { DB_TOKEN } from '@/app/database/db.port'

import type { DrizzleDb } from '@/app/database/db.port'
import type { HealthIndicatorResult } from '@nestjs/terminus'

/**
 * Drizzle database health indicator
 *
 * Verifies the database connection by executing a simple SELECT 1 query
 */
@Injectable()
export class DrizzleHealthIndicator {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDb) {}

  /**
   * Check the database connection health
   *
   * @param key - Health check identifier
   * @returns health check result
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Execute a simple SELECT 1 to test the database connection
      await this.db.execute(sql`SELECT 1`)

      return {
        [key]: {
          status: 'up' as const,
          message: 'Database is available',
        },
      }
    } catch (error) {
      return {
        [key]: {
          status: 'down' as const,
          message:
            error instanceof Error ? error.message : 'Database check failed',
        },
      }
    }
  }
}
