import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config({
  path: '.env',
});

export default {
  schema: './src/database/schema',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
