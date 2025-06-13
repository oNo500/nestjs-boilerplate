import crypto from 'crypto';

export const generateCode = (length = 6) => {
  return crypto
    .randomInt(0, 10 ** length)
    .toString()
    .padStart(length, '0');
};
