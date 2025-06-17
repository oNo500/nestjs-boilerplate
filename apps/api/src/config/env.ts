import { z } from 'zod';

export const EnvSchema = z.object({
  HOST: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRATION: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRATION: z.string(),
  MAIL_HOST: z.string(),
  MAIL_PORT: z.coerce.number().default(587),
  MAIL_SECURE: z.coerce.boolean().default(false), // 是否使用 TLS (如果是465端口则为true)
  MAIL_USERNAME: z.string(),
  MAIL_PASSWORD: z.string(),
  DATABASE_URL: z.string(),
  ALLOWED_ORIGINS: z.string().default('*'),
  API_PREFIX: z.string().default('api'),
});

export type Env = z.infer<typeof EnvSchema>;

export const validateEnv = (env: Record<string, unknown>): Env => {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(parsed.error.message || 'Invalid environment variables');
  }
  return parsed.data;
};
