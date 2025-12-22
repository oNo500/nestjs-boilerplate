import { Inject, Injectable } from '@nestjs/common'
import { usersTable } from '@workspace/database'
import { eq, and } from 'drizzle-orm'

import { DB_TOKEN } from '@/shared-kernel/infrastructure/db/db.port'

import type {
  User,
  UserRepository,
  CreateUserData,
} from '@/shared-kernel/application/ports/user.repository.port'
import type { DrizzleDb } from '@/shared-kernel/infrastructure/db/db.port'

/**
 * Drizzle User Repository implementation
 *
 * Manages user core data persistence
 * Adapted from better-auth schema
 */
@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: DrizzleDb,
  ) {}

  async create(data: CreateUserData): Promise<User> {
    const now = new Date()
    const result = await this.db
      .insert(usersTable)
      .values({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role ?? null,
        emailVerified: false,
        banned: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    return this.toEntity(result[0]!)
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1)

    if (result.length === 0) {
      return null
    }

    return this.toEntity(result[0]!)
  }

  async setBanned(id: string, banned: boolean, reason?: string, expires?: Date): Promise<boolean> {
    const result = await this.db
      .update(usersTable)
      .set({
        banned,
        banReason: reason ?? null,
        banExpires: expires ?? null,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id))

    return (result.rowCount ?? 0) > 0
  }

  async hardDelete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(usersTable)
      .where(eq(usersTable.id, id))

    return (result.rowCount ?? 0) > 0
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1)

    return result.length > 0
  }

  async existsAndActive(id: string): Promise<boolean> {
    const result = await this.db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.id, id),
          eq(usersTable.banned, false),
        ),
      )
      .limit(1)

    return result.length > 0
  }

  private toEntity(record: typeof usersTable.$inferSelect): User {
    return {
      id: record.id,
      name: record.name,
      email: record.email,
      emailVerified: record.emailVerified,
      image: record.image,
      role: record.role,
      banned: record.banned ?? false,
      banReason: record.banReason,
      banExpires: record.banExpires,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }
  }
}
