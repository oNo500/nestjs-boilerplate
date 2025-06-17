import { pgTable, uuid, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';

import { otpTypeEnum } from './_enums';
import { usersTable } from './users';

export const otpsTable = pgTable('otps', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'cascade' }),
  receiver: varchar('receiver', { length: 255 }),
  code: varchar('code', { length: 10 }).notNull(),
  type: otpTypeEnum('type').notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
