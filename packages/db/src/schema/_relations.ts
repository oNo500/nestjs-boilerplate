import { relations } from 'drizzle-orm';

import { usersTable } from './users';
import { profilesTable } from './profiles';
import { sessionsTable } from './sessions';

/**
 * 用户表关系定义
 *
 * - 一个用户对应一条个人资料（Profile）
 * - 一个用户对应多条会话记录（Session）
 */
export const usersRelations = relations(usersTable, ({ one, many }) => ({
  profile: one(profilesTable, {
    fields: [usersTable.id],
    references: [profilesTable.userId],
  }),
  sessions: many(sessionsTable),
}));

/**
 * 个人资料表关系定义
 *
 * - 每条个人资料属于一个用户（User）
 */
export const profilesRelations = relations(profilesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [profilesTable.userId],
    references: [usersTable.id],
  }),
}));

/**
 * 会话表关系定义
 *
 * - 每条会话记录属于一个用户（User）
 */
export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));
