import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

import { usersTable } from '../identity/users.schema'

export const loginStatusEnum = pgEnum('login_status', ['success', 'failed'])

/**
 * Login Logs table
 *
 * Records every login attempt (success or failure) for security auditing.
 * userId is nullable because the user may not exist when login fails with an unknown email.
 */
export const loginLogsTable = pgTable(
  'login_logs',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => usersTable.id, { onDelete: 'set null' }),
    email: text('email').notNull(),
    status: loginStatusEnum('status').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    failReason: text('fail_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('login_logs_user_id_idx').on(table.userId),
    index('login_logs_created_at_idx').on(table.createdAt),
  ],
)

export type LoginLogDatabase = typeof loginLogsTable.$inferSelect
export type InsertLoginLogDatabase = typeof loginLogsTable.$inferInsert
