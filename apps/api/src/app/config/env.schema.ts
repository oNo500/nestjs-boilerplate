import { z } from 'zod'

/**
 * Environment variables schema with Zod validation
 */
export const envSchema = z.object({
  // App environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // App port
  PORT: z
    .string()
    .default('3000')
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => value > 0 && value < 65_536, {
      message: 'PORT must be between 1-65535',
    }),

  // Database connection
  DATABASE_URL: z
    .url()
    .default('postgres://postgres:postgres@localhost:5432/vsa_m_nest'),

  // Database pool config
  DB_POOL_MAX: z
    .string()
    .default('20')
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => value > 0 && value <= 100, {
      message: 'DB_POOL_MAX must be between 1-100',
    }),

  DB_POOL_MIN: z
    .string()
    .default('5')
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => value >= 0 && value <= 50, {
      message: 'DB_POOL_MIN must be between 0-50',
    }),

  DB_POOL_IDLE_TIMEOUT: z
    .string()
    .default('30000')
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => value >= 1000, {
      message: 'DB_POOL_IDLE_TIMEOUT must be at least 1000ms',
    }),

  DB_POOL_CONNECTION_TIMEOUT: z
    .string()
    .default('10000')
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => value >= 1000, {
      message: 'DB_POOL_CONNECTION_TIMEOUT must be at least 1000ms',
    }),

  // JWT config
  JWT_SECRET: z
    .string()
    .min(32, { message: 'JWT_SECRET must be at least 32 characters' })
    .default('your-secret-key-change-me-in-production-min-32-chars'),

  JWT_EXPIRES_IN: z
    .string()
    .default('15m')
    .refine((value) => /^\d+[smhd]$/.test(value), {
      message: 'JWT_EXPIRES_IN format invalid (e.g., 60s, 15m, 2h, 7d)',
    }),

  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .default('7d')
    .refine((value) => /^\d+[smhd]$/.test(value), {
      message: 'JWT_REFRESH_EXPIRES_IN format invalid (e.g., 60s, 15m, 2h, 7d)',
    }),

  // Redis config
  REDIS_HOST: z.string().default('localhost'),

  REDIS_PORT: z
    .string()
    .default('6379')
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => value > 0 && value < 65_536, {
      message: 'REDIS_PORT must be between 1-65535',
    }),

  REDIS_PASSWORD: z.string().optional(),

  REDIS_TTL: z
    .string()
    .default('3600')
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => value > 0, {
      message: 'REDIS_TTL must be greater than 0',
    }),

  // Swagger auto-login (dev only)
  SWAGGER_TEST_EMAIL: z.email().optional(),
  SWAGGER_TEST_PASSWORD: z.string().optional(),
})

/**
 * Environment type
 */
export type Env = z.infer<typeof envSchema>

/**
 * Validate environment variables
 * @throws {Error} if validation fails
 */
export function validateEnv(config: Record<string, unknown>): Env {
  try {
    return envSchema.parse(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map(
          (error_: z.core.$ZodIssue) => `${error_.path.join('.')}: ${error_.message}`,
        )
        .join('\n')

      throw new Error(
        `Environment validation failed:\n${errorMessages}\n\nCheck .env file or environment variables`,
      )
    }
    throw error
  }
}
