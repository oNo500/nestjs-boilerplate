import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

/**
 * 用户表 users
 *
 * 字段说明：
 * - id：主键 ID，UUID 格式，自动生成
 * - email：邮箱地址，最长 255 字符，必填，唯一
 * - password：用户密码，可为空
 * - username：用户名，最长 255 字符，必填，唯一
 * - createdAt：创建时间，带时区，自动填充，必填
 * - updatedAt：更新时间，带时区，自动更新时间，必填
 */
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password'), // Nullable
  username: varchar('username', { length: 255 }).notNull().unique(),
  role: varchar('role', { length: 255 }).notNull().default('user'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});
