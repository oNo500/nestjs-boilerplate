import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

import { usersTable } from './users';

/**
 * 用户会话表 sessions
 *
 * 字段说明：
 * - id：主键 ID，UUID 格式，自动生成
 * - ip：用户登录 IP，默认 'unknown'
 * - location：登录地点，默认 'unknown'
 * - deviceOs：设备操作系统，默认 'unknown'
 * - deviceName：设备名称，默认 'unknown'
 * - deviceType：设备类型，默认 'unknown'
 * - browser：浏览器信息，默认 'unknown'
 * - userAgent：完整 User-Agent 字符串，默认 'unknown'
 * - refreshToken：刷新令牌，必填
 * - userId：关联用户表的 user_id，UUID，必填，用户删除时同步删除
 * - createdAt：创建时间，带时区，自动填充，必填
 * - updatedAt：更新时间，带时区，自动更新时间，必填
 */
export const sessionsTable = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  ip: text('ip').default('unknown'),
  location: text('location').default('unknown'),
  deviceOs: text('device_os').default('unknown'),
  deviceName: text('device_name').default('unknown'),
  deviceType: text('device_type').default('unknown'),
  browser: text('browser').default('unknown'),
  userAgent: text('user_agent').default('unknown'),
  refreshToken: text('refresh_token').notNull(),

  // Foreign key for many-to-one relationship
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});
