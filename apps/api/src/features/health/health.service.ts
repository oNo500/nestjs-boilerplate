import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Schema } from '@repo/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

import { Drizzle } from '@/common/decorators';

@Injectable()
export class HealthService {
  constructor(@Drizzle() private readonly db: NodePgDatabase<Schema>) {}

  async drizzleIsHealth() {
    try {
      await this.db.execute(sql`SELECT 1`);
      return { status: 'ok', message: '数据库连接正常' };
    } catch (error) {
      console.error('数据库健康检查失败', error);
      throw new InternalServerErrorException('数据库健康检查失败');
    }
  }
}
