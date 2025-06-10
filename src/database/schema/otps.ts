import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { otpTypeEnum } from './_enums';

export const otps = pgTable('otps', {
  id: uuid('id').primaryKey().defaultRandom(),
  otp: text('otp').notNull(),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
  type: otpTypeEnum('type').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});
