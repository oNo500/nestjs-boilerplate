import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

/**
 * User preferences
 *
 * Stored in the users.preferences JSONB field
 */
export interface UserPreferences {
  /** Theme: light / dark / follow system */
  theme?: 'light' | 'dark' | 'system'
  /** Language preference */
  lang?: string
  /** Timezone */
  timezone?: string
  /** Whether notifications are enabled */
  notifications?: boolean
}

/**
 * Users table definition
 *
 * Core user entity.
 *
 * Field structure follows Better Auth conventions for future migration compatibility.
 *
 * Better Auth compatible fields:
 *   name, email, emailVerified, image, role, banned, banReason, banExpires
 *
 * Extended fields (business-specific, compatible with Better Auth additionalFields):
 *   username, displayUsername, displayName, bio, preferences
 */
export const usersTable = pgTable(
  'users',
  {
    // Primary key (text, generated using nanoid)
    id: text('id').primaryKey(),

    // ---- Better Auth required fields ----

    // Required by Better Auth, used as fallback display name
    name: text('name').notNull(),
    email: text('email').notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    // Required by Better Auth, kept for OAuth avatar sync
    image: text('image'),

    // ---- Better Auth admin plugin fields ----

    role: text('role'),
    banned: boolean('banned').default(false),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires'),

    // ---- Extended fields (additionalFields) ----

    // Normalized username (lowercased), used for uniqueness / URL paths
    username: text('username')
      .notNull()
      .unique()
      .$defaultFn(() => ''),

    // Original-casing username, used for display / @mention
    displayUsername: text('display_username')
      .notNull()
      .$defaultFn(() => ''),

    // User-facing display name (replaces profiles.displayName)
    displayName: varchar('display_name', { length: 50 }),

    // Biography (replaces profiles.bio)
    bio: varchar('bio', { length: 500 }),

    // User personalization preferences (replaces profiles.preferences)
    preferences: jsonb('preferences').$type<UserPreferences>().default({}),

    // ---- Timestamps ----

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('users_email_idx').on(table.email),
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
