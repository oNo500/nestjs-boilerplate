import * as argon2 from 'argon2';

const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 8,
    timeCost: 5,
    parallelism: 1,
  });
};

const validatePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await argon2.verify(hashedPassword, plainPassword);
  } catch (e) {
    console.error(e);
    return false;
  }
};

export { hashPassword, validatePassword };
