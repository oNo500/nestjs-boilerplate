import { z } from 'zod';

export const EnvSchema = z.object({
  HOST: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  ACCESS_TOKEN_SECRET: z.string(),
});

export type Env = z.infer<typeof EnvSchema>;

export const validateEnv = (env: Record<string, unknown>): Env => {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(parsed.error.message || 'Invalid environment variables');
  }
  return parsed.data;
};
