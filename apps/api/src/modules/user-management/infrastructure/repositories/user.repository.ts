import { randomUUID } from 'node:crypto'

import { Inject, Injectable } from '@nestjs/common'
import {
  accountsTable,
  profilesTable,
  usersTable,
} from '@workspace/database'
import * as bcrypt from 'bcrypt'
import { and, count, eq, gte, ilike, inArray } from 'drizzle-orm'

import { DB_TOKEN } from '@/shared-kernel/infrastructure/db/db.port'

import type {
  CreateUserData,
  UpdateUserData,
  UserInfo,
  UserListQuery,
  UserListResult,
  UserManagementRepository,
  UserSummary,
} from '@/modules/user-management/application/ports/user.repository.port'
import type { DrizzleDb } from '@/shared-kernel/infrastructure/db/db.port'

const BCRYPT_ROUNDS = 12

/**
 * Drizzle User Management Repository implementation
 *
 * Adapted to better-auth schema:
 * - users: core user entity
 * - profiles: user profile
 * - accounts: authentication credentials
 */
@Injectable()
export class UserManagementRepositoryImpl
implements UserManagementRepository {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: DrizzleDb,
  ) {}

  async findAll(query: UserListQuery): Promise<UserListResult> {
    const { page, pageSize, search, role, banned } = query

    // Build user query conditions
    const userConditions = []

    if (banned !== undefined) {
      userConditions.push(eq(usersTable.banned, banned))
    }

    if (role) {
      userConditions.push(eq(usersTable.role, role))
    }

    // If a search term is provided, search both name and email
    let searchUserIds: string[] | undefined
    if (search) {
      // Search users.name
      const nameMatches = await this.db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(ilike(usersTable.name, `%${search}%`))

      // Search users.email
      const emailMatches = await this.db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(ilike(usersTable.email, `%${search}%`))

      searchUserIds = [
        ...new Set([
          ...nameMatches.map((p) => p.id),
          ...emailMatches.map((i) => i.id),
        ]),
      ]

      if (searchUserIds.length === 0) {
        return { data: [], total: 0 }
      }
      userConditions.push(inArray(usersTable.id, searchUserIds))
    }

    const whereClause = userConditions.length > 0 ? and(...userConditions) : undefined

    // Fetch data and total count in parallel
    const [usersData, totalResult] = await Promise.all([
      this.db
        .select()
        .from(usersTable)
        .where(whereClause)
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy(usersTable.createdAt),
      this.db.select({ count: count() }).from(usersTable).where(whereClause),
    ])

    // Batch-fetch associated data
    const userIds = usersData.map((u) => u.id)
    if (userIds.length === 0) {
      return { data: [], total: 0 }
    }

    const profiles = await this.db
      .select()
      .from(profilesTable)
      .where(inArray(profilesTable.userId, userIds))

    // Build lookup map
    const profileMap = new Map(profiles.map((p) => [p.userId, p]))

    // Assemble result
    const data: UserInfo[] = usersData.map((user) => ({
      id: user.id,
      name: user.name,
      displayName: profileMap.get(user.id)?.displayName ?? null,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      banned: user.banned ?? false,
      banReason: user.banReason,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }))

    return {
      data,
      total: totalResult[0]?.count ?? 0,
    }
  }

  async findById(id: string): Promise<UserInfo | null> {
    const user = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1)

    if (user.length === 0) {
      return null
    }

    return this.buildUserInfo(user[0]!)
  }

  async findByEmail(email: string): Promise<UserInfo | null> {
    const user = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1)

    if (user.length === 0) {
      return null
    }

    return this.buildUserInfo(user[0]!)
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = await this.db
      .select({ count: count() })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))

    return (result[0]?.count ?? 0) > 0
  }

  async create(data: CreateUserData): Promise<UserInfo> {
    const userId = randomUUID()
    const accountId = randomUUID()
    const now = new Date()

    // Hash the password
    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS)

    // Create all related records inside a transaction
    await this.db.transaction(async (tx) => {
      // 1. Create user
      await tx.insert(usersTable).values({
        id: userId,
        name: data.name,
        email: data.email.toLowerCase(),
        username: data.email.split('@')[0] ?? data.email, // derive username from email
        displayUsername: data.name, // use name as display name
        role: data.role ?? null,
        emailVerified: false,
        banned: false,
        createdAt: now,
        updatedAt: now,
      })

      // 2. Create profile
      await tx.insert(profilesTable).values({
        userId,
        displayName: data.displayName ?? null,
        createdAt: now,
        updatedAt: now,
      })

      // 3. Create account
      await tx.insert(accountsTable).values({
        id: accountId,
        userId,
        providerId: 'email',
        accountId: data.email.toLowerCase(),
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      })
    })

    const user = await this.findById(userId)
    return user!
  }

  async update(id: string, data: UpdateUserData): Promise<UserInfo | null> {
    const existing = await this.findById(id)
    if (!existing) {
      return null
    }

    await this.db.transaction(async (tx) => {
      // Update the users table
      const userUpdates: Record<string, unknown> = {
        updatedAt: new Date(),
      }
      if (data.name !== undefined) {
        userUpdates.name = data.name
      }
      if (data.banned !== undefined) {
        userUpdates.banned = data.banned
      }
      if (data.banReason !== undefined) {
        userUpdates.banReason = data.banReason
      }
      if (data.role !== undefined) {
        userUpdates.role = data.role
      }

      if (Object.keys(userUpdates).length > 1) {
        await tx
          .update(usersTable)
          .set(userUpdates)
          .where(eq(usersTable.id, id))
      }

      // Update the profiles table
      if (data.displayName !== undefined) {
        await tx
          .update(profilesTable)
          .set({
            displayName: data.displayName,
            updatedAt: new Date(),
          })
          .where(eq(profilesTable.userId, id))
      }
    })

    return this.findById(id)
  }

  async hardDelete(id: string): Promise<boolean> {
    // CASCADE will automatically delete associated records
    const result = await this.db
      .delete(usersTable)
      .where(eq(usersTable.id, id))

    return (result.rowCount ?? 0) > 0
  }

  async getSummary(): Promise<UserSummary> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalResult, activeResult, adminResult, newTodayResult] = await Promise.all([
      this.db.select({ count: count() }).from(usersTable),
      this.db.select({ count: count() }).from(usersTable).where(eq(usersTable.banned, false)),
      this.db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, 'ADMIN')),
      this.db.select({ count: count() }).from(usersTable).where(gte(usersTable.createdAt, today)),
    ])

    return {
      total: totalResult[0]?.count ?? 0,
      active: activeResult[0]?.count ?? 0,
      adminCount: adminResult[0]?.count ?? 0,
      newToday: newTodayResult[0]?.count ?? 0,
    }
  }

  /**
   * Build complete info for a single user
   */
  private async buildUserInfo(
    user: typeof usersTable.$inferSelect,
  ): Promise<UserInfo> {
    const profile = await this.db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, user.id))
      .limit(1)

    return {
      id: user.id,
      name: user.name,
      displayName: profile[0]?.displayName ?? null,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      banned: user.banned ?? false,
      banReason: user.banReason,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
