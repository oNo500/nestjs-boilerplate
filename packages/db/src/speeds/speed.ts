import { pgTable, uuid, varchar, doublePrecision, timestamp } from 'drizzle-orm/pg-core';

import { usersTable } from '../schema/users';

/**
 * 用户速度记录表 speed
 *
 * 字段说明：
 * - id：主键 ID，UUID 格式，自动生成
 * - userId：关联用户表的 user_id，UUID，必填，用户删除时同步删除
 * - value：速度数值，double 类型，必填
 * - unit：速度单位，最长 20 字符，必填（如 km/h, m/s）
 * - recordedAt：速度记录时间，带时区，必填
 * - createdAt：创建时间，带时区，自动填充，必填
 * - updatedAt：更新时间，带时区，自动更新时间，必填
 */
export const speedTable = pgTable('speed', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  value: doublePrecision('value').notNull(),
  unit: varchar('unit', { length: 20 }).notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});
