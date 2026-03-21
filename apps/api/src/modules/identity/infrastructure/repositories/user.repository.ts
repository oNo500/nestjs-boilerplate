import { randomUUID } from 'node:crypto'

import { Inject, Injectable } from '@nestjs/common'
import {
  accountsTable,
  usersTable,
} from '@workspace/database'
import * as bcrypt from 'bcrypt'
import { and, count, eq, gte, ilike, inArray } from 'drizzle-orm'

import { DB_TOKEN } from '@/app/database/db.port'

import type { DrizzleDb } from '@/app/database/db.port'
import type {
  CreateUserData,
  UpdateUserData,
  UserInfo,
  UserListQuery,
  UserListResult,
  IdentityRepository,
  UserSummary,
} from '@/modules/identity/application/ports/user.repository.port'

const BCRYPT_ROUNDS = 12

/**
 * Drizzle User Management Repository implementation
 *
 * users: core user entity (identity + extended fields)
 * accounts: authentication credentials
 */
@Injectable()
export class UserRepositoryImpl
implements IdentityRepository {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: DrizzleDb,
  ) {}

  async findAll(query: UserListQuery): Promise<UserListResult> {
    const { page, pageSize, search, role, banned } = query

    const userConditions = []

    if (banned !== undefined) {
      userConditions.push(eq(usersTable.banned, banned))
    }

    if (role) {
      userConditions.push(eq(usersTable.role, role))
    }

    if (search) {
      const nameMatches = await this.db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(ilike(usersTable.name, `%${search}%`))

      const emailMatches = await this.db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(ilike(usersTable.email, `%${search}%`))

      const searchUserIds = [
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

    const data: UserInfo[] = usersData.map((user) => this.toUserInfo(user))

    return {
      data,
      total: totalResult[0]?.count ?? 0,
    }
  }

  async findById(id: string): Promise<UserInfo | null> {
    const result = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1)

    return result[0] ? this.toUserInfo(result[0]) : null
  }

  async findByEmail(email: string): Promise<UserInfo | null> {
    const result = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1)

    return result[0] ? this.toUserInfo(result[0]) : null
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

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS)

    await this.db.transaction(async (tx) => {
      await tx.insert(usersTable).values({
        id: userId,
        name: data.name,
        email: data.email.toLowerCase(),
        username: data.email.split('@')[0] ?? data.email,
        displayUsername: data.name,
        displayName: data.displayName ?? null,
        role: data.role ?? null,
        emailVerified: false,
        banned: false,
        createdAt: now,
        updatedAt: now,
      })

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

    return (await this.findById(userId))!
  }

  async update(id: string, data: UpdateUserData): Promise<UserInfo | null> {
    const existing = await this.findById(id)
    if (!existing) {
      return null
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() }

    if (data.name !== undefined) updates.name = data.name
    if (data.displayName !== undefined) updates.displayName = data.displayName
    if (data.banned !== undefined) updates.banned = data.banned
    if (data.banReason !== undefined) updates.banReason = data.banReason
    if (data.role !== undefined) updates.role = data.role

    await this.db.update(usersTable).set(updates).where(eq(usersTable.id, id))

    return this.findById(id)
  }

  async existsAndActive(id: string): Promise<boolean> {
    const result = await this.db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(and(eq(usersTable.id, id), eq(usersTable.banned, false)))
      .limit(1)
    return result.length > 0
  }

  async hardDelete(id: string): Promise<boolean> {
    const result = await this.db.delete(usersTable).where(eq(usersTable.id, id))
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

  private toUserInfo(user: typeof usersTable.$inferSelect): UserInfo {
    return {
      id: user.id,
      name: user.name,
      displayName: user.displayName ?? null,
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
