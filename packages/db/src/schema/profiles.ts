import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

import { usersTable } from './users';
import { genderEnum } from './_enums';

/**
 * 用户资料表 profiles
 *
 * 字段说明：
 * - id：主键 ID，UUID 格式，自动生成
 * - username：用户名，最长 255 字符，必填
 * - gender：性别，枚举值，默认 'UNKNOWN'，必填
 * - phoneNumber：手机号码，最长 50 字符，唯一
 * - avatar：头像地址（URL 或 Base64），可为空
 * - dateOfBirth：出生日期，带时区，非必填
 * - address：地址，文本，可为空
 * - userId：关联用户表的 user_id，UUID，唯一，必填，用户被删除时同步删除
 * - createdAt：创建时间，带时区，自动填充，必填
 * - updatedAt：更新时间，带时区，自动更新时间，必填
 */
export const profilesTable = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 255 }).notNull(),
  gender: genderEnum('gender').default('UNKNOWN').notNull(),
  phoneNumber: varchar('phone_number', { length: 50 }).unique(),
  avatar: text('avatar'),
  dateOfBirth: timestamp('date_of_birth', { withTimezone: true }),
  address: text('address'),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});
