import { pgEnum } from 'drizzle-orm/pg-core';

export const genderEnum = pgEnum('gender', [
  'MALE',
  'FEMALE',
  'OTHER',
  'UNKNOWN',
]);

export const otpTypeEnum = pgEnum('otp_type', [
  'EMAIL_VERIFICATION',
  'EMAIL_CONFIRMATION',
  'PASSWORD_RESET',
]);
