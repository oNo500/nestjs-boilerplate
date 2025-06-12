import crypto from 'crypto';

export const generateOTP = (length = 6) => {
  return crypto
    .randomInt(0, 10 ** length)
    .toString()
    .padStart(length, '0');
};
