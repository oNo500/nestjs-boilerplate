import { pgEnum } from 'drizzle-orm/pg-core';

// 性别枚举，用于标识用户的性别类型
export const genderEnum = pgEnum('gender', ['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']);

// OTP 类型枚举，用于标识一次性密码（OTP）的用途
export const otpTypeEnum = pgEnum('otp_type', [
  'EMAIL_REGISTER', // 邮箱注册
  'PASSWORD_RESET', // 密码重置
]);
