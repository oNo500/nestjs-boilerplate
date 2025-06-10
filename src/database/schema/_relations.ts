import { relations } from 'drizzle-orm';
import { users } from './users';
import { profiles } from './profiles';
import { sessions } from './sessions';

// User relations
export const usersRelations = relations(users, ({ one, many }) => ({
  // User has one Profile
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  // User has many Sessions
  sessions: many(sessions),
}));

// Profile relations
export const profilesRelations = relations(profiles, ({ one }) => ({
  // Profile belongs to one User
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

// Session relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  // Session belongs to one User
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
