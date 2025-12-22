import { relations } from 'drizzle-orm'

import {
  usersTable,
  profilesTable,
  accountsTable,
  sessionsTable,
} from './schemas/index.js'

/**
 * Users table relations
 */
export const usersRelations = relations(usersTable, ({ one, many }) => ({
  // 1:1 with profiles
  profile: one(profilesTable, {
    fields: [usersTable.id],
    references: [profilesTable.userId],
  }),
  // 1:N with auth_accounts
  accounts: many(accountsTable),
  // 1:N with auth_sessions
  sessions: many(sessionsTable),
}))

/**
 * Profiles table relations
 */
export const profilesRelations = relations(profilesTable, ({ one }) => ({
  // N:1 with users
  user: one(usersTable, {
    fields: [profilesTable.userId],
    references: [usersTable.id],
  }),
}))

/**
 * Auth Accounts table relations
 */
export const accountsRelations = relations(accountsTable, ({ one }) => ({
  // N:1 with users
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),
}))

/**
 * Auth Sessions table relations
 */
export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  // N:1 with users
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}))
