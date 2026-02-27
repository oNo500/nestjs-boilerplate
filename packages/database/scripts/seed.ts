#!/usr/bin/env node

/**
 * Database seed script
 *
 * Creates fixed test accounts: admin (administrator) and user (regular user)
 *
 * Usage: pnpm run db:seed
 */

import bcrypt from 'bcrypt'
import { eq, or } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { boolean, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import pg from 'pg'

// Load environment variables
process.loadEnvFile()

const usersTable = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    username: text('username').notNull().unique(),
    displayUsername: text('display_username').notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    role: text('role'),
    banned: boolean('banned').default(false),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('users_email_idx').on(table.email),
    uniqueIndex('users_username_idx').on(table.username),
  ],
)

const accountsTable = pgTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('accounts_provider_account_idx').on(table.providerId, table.accountId),
    index('accounts_userId_idx').on(table.userId),
  ],
)

const TEST_ACCOUNTS = [
  {
    email: 'admin@example.com',
    username: 'admin',
    name: 'Admin',
    role: 'ADMIN',
    password: '12345678',
  },
  {
    email: 'user@example.com',
    username: 'user',
    name: 'User',
    role: 'USER',
    password: '12345678',
  },
] as const

async function seed() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not configured')
    process.exit(1)
  }

  console.log('🔄 Connecting to database...')

  const pool = new pg.Pool({ connectionString: databaseUrl })
  const db = drizzle(pool)

  try {
    for (const account of TEST_ACCOUNTS) {
      console.log(`🔍 Checking account: ${account.email}`)

      const existingUsers = await db
        .select()
        .from(usersTable)
        .where(or(eq(usersTable.email, account.email), eq(usersTable.username, account.username)))

      if (existingUsers.length > 0) {
        console.log(`✅ ${account.email} already exists, skipping`)
        continue
      }

      const userId = crypto.randomUUID()
      const passwordHash = await bcrypt.hash(account.password, 10)

      await db.insert(usersTable).values({
        id: userId,
        name: account.name,
        email: account.email,
        username: account.username,
        displayUsername: account.username,
        role: account.role,
      })

      await db.insert(accountsTable).values({
        id: crypto.randomUUID(),
        userId,
        providerId: 'email',
        accountId: account.email,
        password: passwordHash,
      })

      console.log(`✅ ${account.email} (role: ${account.role}) created successfully`)
    }
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
    console.log('🔒 Database connection closed')
  }
}

await seed()
