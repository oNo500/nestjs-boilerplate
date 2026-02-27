import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.url().default('http://localhost:3000'),
})

const parsed = envSchema.parse(import.meta.env)

export const env = {
  API_URL: parsed.VITE_API_URL,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const
