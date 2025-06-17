import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

import { Drizzle } from '@/common/decorators';

@Injectable()
export class DrizzleHealthIndicator {
  constructor(
    @Drizzle() private readonly db: NodePgDatabase,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await this.db.execute(sql`SELECT 1`);
      return indicator.up();
    } catch (error) {
      return indicator.down({ error: error?.message || error });
    }
  }
}
