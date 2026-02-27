import { jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { usersTable } from './users.schema'

/**
 * User preferences
 *
 * A value object shared across modules, defining user personalization settings
 * Stored in the profiles.preferences JSONB field
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
 * Profiles table definition
 *
 * User profile information, split from the users table:
 * - Strongly 1:1 associated with the users table (user_id is both PK and FK)
 * - Can be updated independently without affecting core user data
 * - preferences uses JSONB to avoid frequent column additions
 */
export const profilesTable = pgTable('profiles', {
  // Primary key + foreign key (strong 1:1 association)
  userId: text('user_id')
    .primaryKey()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  // Display name / nickname
  displayName: varchar('display_name', { length: 50 }),

  // Avatar URL
  avatarUrl: text('avatar_url'),

  // Biography
  bio: varchar('bio', { length: 500 }),

  // User preferences (JSONB)
  preferences: jsonb('preferences').$type<UserPreferences>().default({}),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

/**
 * Profile database type (inferred from table definition)
 */
export type ProfileDatabase = typeof profilesTable.$inferSelect

/**
 * Insert Profile type (inferred from table definition)
 */
export type InsertProfileDatabase = typeof profilesTable.$inferInsert
