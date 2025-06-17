import { pgEnum } from 'drizzle-orm/pg-core';

export const genderEnum = pgEnum('gender', ['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']);

export const otpTypeEnum = pgEnum('otp_type', [
  'EMAIL_REGISTER', // Email Register
  'PASSWORD_RESET', // Password Reset
]);

export type OTPType = (typeof otpTypeEnum.enumValues)[number];
export type Gender = (typeof genderEnum.enumValues)[number];
