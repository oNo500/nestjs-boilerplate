import { relations } from 'drizzle-orm'

import {
  usersTable,
  accountsTable,
  sessionsTable,
} from './schemas'

/**
 * Users table relations
 */
export const usersRelations = relations(usersTable, ({ many }) => ({
  // 1:N with accounts
  accounts: many(accountsTable),
  // 1:N with sessions
  sessions: many(sessionsTable),
}))

/**
 * Accounts table relations
 */
export const accountsRelations = relations(accountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),
}))

/**
 * Sessions table relations
 */
export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}))
