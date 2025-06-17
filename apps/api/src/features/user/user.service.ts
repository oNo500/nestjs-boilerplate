import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { usersTable } from '@repo/db';
import { eq } from 'drizzle-orm';

import { Drizzle } from '@/common/decorators';

@Injectable()
export class UserService {
  constructor(@Drizzle() private readonly db: NodePgDatabase) {}

  async getUser(id: string) {
    return this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1)
      .then(([user]) => user);
  }
}
