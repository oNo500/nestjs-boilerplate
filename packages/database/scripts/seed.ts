#!/usr/bin/env node

/**
 * Database seed script
 *
 * Creates fixed test accounts: admin (administrator) and user (regular user)
 *
 * Usage: pnpm run db:seed
 */

import bcrypt from 'bcrypt'
import { config } from 'dotenv'
import { eq, or } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { accountsTable, usersTable } from '../src/schemas/identity/index'

// Load environment variables
config({ path: '.env' })

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
  const databaseUrl = process.env['DATABASE_URL']
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not configured')
    process.exit(1)
  }

  console.log('🔄 Connecting to database...')

  const pool = new Pool({ connectionString: databaseUrl })
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
