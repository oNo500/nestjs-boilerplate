import { relations } from 'drizzle-orm';
import { usersTable } from './users';
import { profilesTable } from './profiles';
import { sessionsTable } from './sessions';

// User relations
export const usersRelations = relations(usersTable, ({ one, many }) => ({
  // User has one Profile
  profile: one(profilesTable, {
    fields: [usersTable.id],
    references: [profilesTable.userId],
  }),
  // User has many Sessions
  sessions: many(sessionsTable),
}));

// Profile relations
export const profilesRelations = relations(profilesTable, ({ one }) => ({
  // Profile belongs to one User
  user: one(usersTable, {
    fields: [profilesTable.userId],
    references: [usersTable.id],
  }),
}));

// Session relations
export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  // Session belongs to one User
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));
