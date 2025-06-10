import { Injectable, Inject } from '@nestjs/common';
import { DrizzleAsyncProvider } from './database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '@/database/schema';

@Injectable()
export class AppService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }
  async getFirstRole() {
    const existingUserRole = (await this.db.select().from(schema.users))
      .findLast;
    return existingUserRole;
  }
}
