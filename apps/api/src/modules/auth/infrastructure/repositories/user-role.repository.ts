import { Inject, Injectable } from '@nestjs/common'
import { usersTable } from '@workspace/database'
import { eq } from 'drizzle-orm'

import { DB_TOKEN } from '@/shared-kernel/infrastructure/db/db.port'

import type { UserRoleRepository } from '@/modules/auth/application/ports/user-role.repository.port'
import type { RoleType } from '@/shared-kernel/domain/value-objects/role.vo'
import type { DrizzleDb } from '@/shared-kernel/infrastructure/db/db.port'

/**
 * Drizzle UserRole Repository implementation
 *
 * Single role management (compatible with better-auth usersTable.role field)
 */
@Injectable()
export class UserRoleRepositoryImpl implements UserRoleRepository {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: DrizzleDb,
  ) {}

  async setRole(userId: string, role: RoleType | null): Promise<void> {
    await this.db
      .update(usersTable)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId))
  }

  async getRole(userId: string): Promise<RoleType | null> {
    const result = await this.db
      .select({ role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1)

    if (result.length === 0) {
      return null
    }

    return result[0]!.role as RoleType | null
  }

  async hasRole(userId: string, role: RoleType): Promise<boolean> {
    const userRole = await this.getRole(userId)
    return userRole === role
  }

  async getUserIdsByRole(role: RoleType): Promise<string[]> {
    const results = await this.db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.role, role))

    return results.map((r) => r.id)
  }
}
