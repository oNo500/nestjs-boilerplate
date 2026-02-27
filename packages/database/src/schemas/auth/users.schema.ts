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
 * - Contains fields required by Better Auth: name, email, emailVerified, image
 * - Business profile details are in the profiles table (name/image will be synced)
 * - Roles are in the user_roles table
 * - Authentication info is in the auth_accounts table
 * - Session info is in the auth_sessions table
 */
export const usersTable = pgTable(
  'users',
  {
    // Primary key (text, generated using nanoid)
    id: text('id').primaryKey(),

    // name (used as the full display name)
    // - Required field by Better Auth
    // - Purpose: the user's full display name, may contain spaces and special characters
    // - Characteristic: more flexible than displayUsername, can be changed at any time
    // - Examples: "Zhang San", "John Doe", "testuser123"
    name: text('name').notNull(),

    email: text('email').notNull(),

    // username (normalized username)
    // - Storage format: lowercased (e.g. "TestUser" -> "testuser")
    // - Purpose: database uniqueness constraint, login verification, URL paths
    // - Characteristic: facilitates comparison and querying, avoids case conflicts
    // - Constraint: unique index (users_username_idx)
    username: text('username')
      .notNull()
      .unique()
      .$defaultFn(() => ''), // empty string default, populated by the application layer before insert

    // displayUsername (username in original format, generally used as a nickname)
    // - Storage format: preserves the original format entered by the user (e.g. "TestUser")
    // - Purpose: UI display, profile presentation, @mention functionality
    // - Characteristic: respects the user's formatting preference, provides better visual experience
    // - Relationship: corresponds to username but preserves original casing
    displayUsername: text('display_username')
      .notNull()
      .$defaultFn(() => ''), // empty string default, populated by the application layer before insert
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
    // Unique index: username
    uniqueIndex('users_username_idx').on(table.username),
  ],
)

/**
 * User database type (inferred from table definition)
 */
export type UserDatabase = typeof usersTable.$inferSelect

/**
 * Insert User type (inferred from table definition)
 */
export type InsertUserDatabase = typeof usersTable.$inferInsert
