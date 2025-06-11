import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { otpTypeEnum } from './_enums';
import { usersTable } from './users';

export const otpsTable = pgTable('otps', {
  id: uuid('id').primaryKey().defaultRandom(),
  otp: text('otp').notNull(),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
  type: otpTypeEnum('type').notNull(),
  userId: uuid('user_id').references(() => usersTable.id, {
    onDelete: 'cascade',
  }),
  email: text('email'), // 可为空

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});
