import { jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { usersTable } from './users.schema.js'

/**
 * User preferences
 *
 * Shared value object for user personalization
 * Stored in profiles.preferences JSONB field
 */
export interface UserPreferences {
  /** Theme: light/dark/system */
  theme?: 'light' | 'dark' | 'system'
  /** Language preference */
  lang?: string
  /** Timezone */
  timezone?: string
  /** Notifications enabled */
  notifications?: boolean
}

/**
 * Profiles table
 *
 * User profile data, separated from users table:
 * - 1:1 relation with users table (user_id is both PK and FK)
 * - Can be updated independently without affecting core user data
 * - Uses JSONB for preferences to avoid frequent schema changes
 */
export const profilesTable = pgTable('profiles', {
  // Primary key + Foreign key (1:1 relation)
  userId: text('user_id')
    .primaryKey()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  // Display name/nickname
  displayName: varchar('display_name', { length: 50 }),

  // Avatar URL
  avatarUrl: text('avatar_url'),

  // Bio
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
 * Profile database type (inferred from table)
 */
export type ProfileDatabase = typeof profilesTable.$inferSelect

/**
 * Insert profile type (inferred from table)
 */
export type InsertProfileDatabase = typeof profilesTable.$inferInsert
