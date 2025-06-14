import * as dotenv from 'dotenv';

import type { Config } from 'drizzle-kit';

dotenv.config({
  path: '.env',
});

export default {
  schema: './src/schema',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
