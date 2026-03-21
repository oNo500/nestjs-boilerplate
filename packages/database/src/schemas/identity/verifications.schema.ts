import {
  index,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

/**
 * Auth Verification Tokens table definition
 *
 *
 * Design characteristics:
 * - Only one valid token per identifier per type
 * - Validity period is typically 15-30 minutes
 * - Deleted immediately after verification
 */
export const verificationsTable = pgTable(
  'verifications',
  {
    // Primary key (text, generated using nanoid)
    id: text('id').primaryKey(),

    // Required fields by Better Auth
    identifier: text('identifier').notNull(), // email / phone number
    value: text('value').notNull(), // token value (named "value" as required by Better Auth)
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),

    // Extended field: type distinction — identifier already exists, no need to add a separate type field
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
 * AuthVerificationToken database type (inferred from table definition)
 */
export type VerificationTokenDatabase
  = typeof verificationsTable.$inferSelect

/**
 * Insert AuthVerificationToken type (inferred from table definition)
 */
export type InsertVerificationTokenDatabase
  = typeof verificationsTable.$inferInsert
