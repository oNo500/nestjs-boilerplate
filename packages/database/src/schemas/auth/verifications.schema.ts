import {
  index,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

/**
 * Auth Verification Tokens table definition
 *
 * Design features:
 * - Only one valid token per identifier and type
 * - Typically valid for 15-30 minutes
 * - Deleted immediately after verification
 */
export const verificationsTable = pgTable(
  'verifications',
  {
    // Primary key (text, generated using nanoid)
    id: text('id').primaryKey(),

    // Better Auth required fields
    identifier: text('identifier').notNull(), // Email/phone number
    value: text('value').notNull(), // Token value (Better Auth requires naming as 'value')
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),

    // Extended field: type differentiation - no need for type as identifier exists
    // type: text('type', {
    //   enum: ['PASSWORD_RESET', 'EMAIL_VERIFY', 'PHONE_VERIFY', 'TWO_FACTOR'],
    // }),

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
    index('verifications_identifier_idx').on(table.identifier),
  ],
)

/**
 * AuthVerificationToken database type (inferred from table)
 */
export type VerificationTokenDatabase
  = typeof verificationsTable.$inferSelect

/**
 * Insert AuthVerificationToken type (inferred from table)
 */
export type InsertVerificationTokenDatabase
  = typeof verificationsTable.$inferInsert
