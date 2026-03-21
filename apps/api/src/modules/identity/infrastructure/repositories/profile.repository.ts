import { Inject, Injectable } from '@nestjs/common'
import { usersTable } from '@workspace/database'
import { eq } from 'drizzle-orm'

import { DB_TOKEN } from '@/app/database/db.port'

import type { DrizzleDb } from '@/app/database/db.port'
import type {
  ProfileData,
  ProfileRepository,
  UpdateProfileData,
} from '@/modules/identity/application/ports/profile.repository.port'

@Injectable()
export class ProfileRepositoryImpl implements ProfileRepository {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: DrizzleDb,
  ) {}

  async findById(id: string): Promise<ProfileData | null> {
    const result = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1)

    return result[0] ? this.toProfileData(result[0]) : null
  }

  async update(id: string, data: UpdateProfileData): Promise<ProfileData | null> {
    const updates: Record<string, unknown> = { updatedAt: new Date() }

    if (data.displayName !== undefined) updates.displayName = data.displayName
    if (data.bio !== undefined) updates.bio = data.bio
    if (data.avatarUrl !== undefined) updates.image = data.avatarUrl

    await this.db.update(usersTable).set(updates).where(eq(usersTable.id, id))

    return this.findById(id)
  }

  private toProfileData(user: typeof usersTable.$inferSelect): ProfileData {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      displayName: user.displayName ?? null,
      bio: user.bio ?? null,
      avatarUrl: user.image ?? null,
    }
  }
}
