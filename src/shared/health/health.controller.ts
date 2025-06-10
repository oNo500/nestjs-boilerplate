import { DrizzleAsyncProvider } from '@/database/drizzle.provider';
import schema from '@/database/schema';
import { Controller, Get, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  @Get()
  async health() {
    const result = await this.db.execute('SELECT 1');
    return result;
  }

  @Get('db')
  async dbHealth() {
    const result = await this.db.execute('SELECT 1');
    return result;
  }
}
