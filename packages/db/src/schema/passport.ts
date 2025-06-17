import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

import { usersTable } from './users';

export const passportTable = pgTable('passport', {
  id: uuid('id').primaryKey().defaultRandom(),
  ip: text('ip').default('unknown'),
  location: text('location').default('unknown'),
  deviceOs: text('device_os').default('unknown'),
  deviceName: text('device_name').default('unknown'),
  deviceType: text('device_type').default('unknown'),
  browser: text('browser').default('unknown'),
  userAgent: text('user_agent').default('unknown'),
  refreshToken: text('refresh_token').notNull(),

  // Foreign key for many-to-one relationship
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});
