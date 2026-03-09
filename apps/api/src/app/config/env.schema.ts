import { z } from 'zod'

/**
 * Environment variable schema definition
 *
 * Uses Zod for type-safe environment variable validation
 */
export const envSchema = z.object({
  // Application environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Application port
  PORT: z
    .string()
    .default('3000')
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => value > 0 && value < 65_536, {
      message: 'PORT must be between 1 and 65535',
    }),

  // Database connection string
  DATABASE_URL: z
    .url()
    .default('postgres://postgres:postgres@localhost:5432/vsa_m_nest'),

  // Database connection pool configuration
  DB_POOL_MAX: z
    .string()
    .default('20')
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => value > 0 && value <= 100, {
      message: 'DB_POOL_MAX must be between 1 and 100',
    }),

  DB_POOL_MIN: z
    .string()
    .default('5')
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => value >= 0 && value <= 50, {
      message: 'DB_POOL_MIN must be between 0 and 50',
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

  // JWT configuration
  JWT_SECRET: z
    .string()
    .min(32, { message: 'JWT_SECRET must be at least 32 characters long (use a randomly generated key)' })
    .default('your-secret-key-change-me-in-production-min-32-chars'),

  JWT_EXPIRES_IN: z
    .string()
    .default('15m')
    .refine((value) => /^\d+[smhd]$/.test(value), {
      message: 'JWT_EXPIRES_IN format is invalid (e.g. 60s, 15m, 2h, 7d)',
    }),

  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .default('7d')
    .refine((value) => /^\d+[smhd]$/.test(value), {
      message: 'JWT_REFRESH_EXPIRES_IN format is invalid (e.g. 60s, 15m, 2h, 7d)',
    }),

  // CORS configuration
  ALLOWED_ORIGINS: z
    .string()
    .optional()
    .transform((value) => value?.split(',').map((s) => s.trim()).filter(Boolean)),

  // Redis configuration (supports redis:// and rediss:// for TLS encrypted connections)
  REDIS_URL: z
    .string()
    .refine((value) => /^rediss?:\/\/.+/.test(value), {
      message: 'REDIS_URL must start with redis:// or rediss://',
    })
    .default('redis://localhost:6379'),

  REDIS_TTL: z
    .string()
    .default('3600')
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => value > 0, {
      message: 'REDIS_TTL must be greater than 0',
    }),

  // API base URL (used as the type URI for RFC 9457 Problem Details)
  API_BASE_URL: z
    .url()
    .default('https://api.example.com'),

  // OAuth configuration (optional; OAuth login is disabled when not set)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  OAUTH_CALLBACK_BASE_URL: z.url().default('http://localhost:3000/api/auth/oauth'),
  FRONTEND_URL: z.url().default('http://localhost:3001'),

  // Rate limiting configuration (tighten in production; no limit if unset in local/CI)
  THROTTLE_TTL: z
    .string()
    .default('60000')
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => value > 0, { message: 'THROTTLE_TTL must be greater than 0' }),

  THROTTLE_LIMIT: z
    .string()
    .default('100000')
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => value > 0, { message: 'THROTTLE_LIMIT must be greater than 0' }),

})

/**
 * Environment variable type
 */
export type Env = z.infer<typeof envSchema>

/**
 * Validate environment variables
 *
 * @throws {z.ZodError} if environment variable validation fails
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
        `Environment variable validation failed:\n${errorMessages}\n\nPlease check your .env file or environment variable configuration`,
        { cause: error },
      )
    }
    throw error
  }
}
