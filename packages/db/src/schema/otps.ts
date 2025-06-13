import { pgTable, uuid, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';

import { otpTypeEnum } from './_enums';
import { usersTable } from './users';

/**
 * 通用 OTP 验证码表 otps
 *
 * 用于管理一次性验证码，适配多种验证用途：
 * - 注册
 * - 找回密码
 * - 短信登录
 * - 二步验证
 * - 支付验证
 *
 * 字段说明：
 * - id：主键 ID，UUID 格式，自动生成
 * - userId：关联用户 ID，部分场景可为空（如注册前）
 * - receiver：验证码接收方，邮箱/手机号，必填
 * - code：验证码字符串，必填
 * - type：验证码类型，来源于 otp_type 枚举
 * - isUsed：验证码是否已使用，默认 false
 * - expiresAt：验证码过期时间，必填
 * - createdAt：创建时间，自动填充
 */
export const otpsTable = pgTable('otps', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'cascade' }),
  receiver: varchar('receiver', { length: 255 }),
  code: varchar('code', { length: 10 }).notNull(),
  type: otpTypeEnum('type').notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
