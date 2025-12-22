import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  // Use compiled files as drizzle-kit loads with CommonJS
  schema: ['./dist/schemas/**/*.schema.js'],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
