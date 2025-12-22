import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

import { usersTable } from './users.schema.js'

/**
 * Auth Sessions table definition
 *
 * Unified session management, compatible with Better Auth:
 * - Session token storage
 * - Device information tracking
 * - Session revocation support
 * - Multi-device login management
 */
export const sessionsTable = pgTable(
  'sessions',
  {
    // Primary key (text, generated using nanoid)
    id: text('id').primaryKey(),

    // User reference (foreign key)
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),

    // Better Auth required fields
    token: text('token').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    // admin
    impersonatedBy: text('impersonated_by'),

    // Device info (Better Auth compatible)
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),

    // Extended field: revoked status -> deletion or expired marking handles this, no extra field needed
    // isRevoked: boolean('is_revoked').notNull().default(false),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Index: query by user ID
    index('sessions_user_id_idx').on(table.userId),
    // Unique index: query by token
    uniqueIndex('sessions_token_idx').on(table.token),
    // Index: expiration time (for cleanup)
    index('sessions_expires_at_idx').on(table.expiresAt),
  ],
)

/**
 * AuthSession database type (inferred from table)
 */
export type SessionDatabase = typeof sessionsTable.$inferSelect

/**
 * Insert AuthSession type (inferred from table)
 */
export type InsertSessionDatabase = typeof sessionsTable.$inferInsert
