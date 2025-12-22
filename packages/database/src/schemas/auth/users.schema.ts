import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

/**
 * Users table definition
 *
 * Core user entity, compatible with Better Auth:
 * - Contains Better Auth required fields: name, email, emailVerified, image
 * - Profile details in profiles table (name/image synced)
 * - Roles in user_roles table
 * - Auth info in auth_accounts table
 * - Session info in auth_sessions table
 */
export const usersTable = pgTable(
  'users',
  {
    // Primary key (text, generated using nanoid)
    id: text('id').primaryKey(),

    // Better Auth required fields
    name: text('name').notNull(),
    email: text('email').notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    role: text('role'),
    // admin plugin
    banned: boolean('banned').default(false),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires'),
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

    // Unique index: email
    uniqueIndex('users_email_idx').on(table.email),
  ],
)

/**
 * User database type (inferred from table)
 */
export type UserDatabase = typeof usersTable.$inferSelect

/**
 * Insert User type (inferred from table)
 */
export type InsertUserDatabase = typeof usersTable.$inferInsert
