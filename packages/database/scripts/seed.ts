#!/usr/bin/env node

/**
 * Database seed script
 *
 * Creates test account for Swagger auto-login
 *
 * Usage: pnpm run db:seed
 */

import bcrypt from 'bcrypt'
import { config } from 'dotenv'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core' // Inline schema to avoid ESM/path alias issues
import pg from 'pg'

// Load environment variables
config()

const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('user'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

const credentialsTable = pgTable('credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

async function seed() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not configured')
    process.exit(1)
  }

  const email = process.env.SWAGGER_TEST_EMAIL
  const password = process.env.SWAGGER_TEST_PASSWORD

  if (!email || !password) {
    console.error('❌ SWAGGER_TEST_EMAIL or SWAGGER_TEST_PASSWORD not configured')
    console.log('Please configure in .env file:')
    console.log('  SWAGGER_TEST_EMAIL=test@example.com')
    console.log('  SWAGGER_TEST_PASSWORD=TestPassword123')
    process.exit(1)
  }

  console.log('🔄 Connecting to database...')

  const pool = new pg.Pool({ connectionString: databaseUrl })
  const db = drizzle(pool)

  try {
    // Check if user already exists
    console.log(`🔍 Checking test account: ${email}`)
    const existingUsers = await db.select().from(usersTable).where(eq(usersTable.email, email))

    if (existingUsers.length > 0) {
      console.log('✅ Test account already exists, skipping creation')
      return
    }

    // Create user
    console.log('📝 Creating test account...')

    const passwordHash = await bcrypt.hash(password, 10)

    const [newUser] = await db
      .insert(usersTable)
      .values({
        username: 'testuser',
        email,
        role: 'user',
        status: 'active',
      })
      .returning()

    if (!newUser) {
      throw new Error('Failed to create user')
    }

    // Create credentials
    await db.insert(credentialsTable).values({
      userId: newUser.id,
      passwordHash,
    })

    console.log('✅ Test account created successfully!')
    console.log(`   Email: ${email}`)
    console.log(`   Username: testuser`)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
    console.log('🔒 Database connection closed')
  }
}

await seed()
