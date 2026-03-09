import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_APP_NAME: z.string().optional().default('example app'),
    NEXT_PUBLIC_APP_URL: z.url().optional().default('http://localhost:3000'),
    NEXT_PUBLIC_API_URL: z.url().optional().default('http://localhost:3000'),
  },
  shared: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
})
