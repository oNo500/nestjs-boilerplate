import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    // Backend URL (for proxy.ts and auth route handlers)
    API_UPSTREAM_BASE_URL: z.string(),
  },
  client: {},
  shared: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
  },
  runtimeEnv: {
    API_UPSTREAM_BASE_URL: process.env.API_UPSTREAM_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
})
