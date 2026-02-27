import { Inject, Injectable } from '@nestjs/common'
import { profilesTable } from '@workspace/database'
import { eq } from 'drizzle-orm'

import { Profile } from '@/modules/profile/domain/aggregates/profile.aggregate'
import { DB_TOKEN } from '@/shared-kernel/infrastructure/db/db.port'

import type { ProfileRepository } from '@/modules/profile/application/ports/profile.repository.port'
import type { DrizzleDb } from '@/shared-kernel/infrastructure/db/db.port'

/**
 * Drizzle Profile Repository implementation
 *
 * Responsible for persisting and reconstituting user profile data.
 */
@Injectable()
export class ProfileRepositoryImpl implements ProfileRepository {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: DrizzleDb,
  ) {}

  async save(profile: Profile): Promise<void> {
    const data = {
      userId: profile.userId,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      preferences: profile.preferences,
      updatedAt: profile.updatedAt,
    }

    // Check if the profile already exists, perform upsert via ternary expression
    const existing = await this.exists(profile.userId)

    await (existing
      ? this.db
          .update(profilesTable)
          .set(data)
          .where(eq(profilesTable.userId, profile.userId))
      : this.db.insert(profilesTable).values({
          ...data,
          createdAt: profile.createdAt,
        }))
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    const result = await this.db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId))
      .limit(1)

    if (result.length === 0) {
      return null
    }

    return this.toDomain(result[0]!)
  }

  async exists(userId: string): Promise<boolean> {
    const result = await this.db
      .select({ userId: profilesTable.userId })
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId))
      .limit(1)

    return result.length > 0
  }

  async delete(userId: string): Promise<boolean> {
    const result = await this.db
      .delete(profilesTable)
      .where(eq(profilesTable.userId, userId))
    return (result.rowCount ?? 0) > 0
  }

  /**
   * Maps a database record to a domain object.
   */
  private toDomain(record: typeof profilesTable.$inferSelect): Profile {
    return Profile.reconstitute(
      record.userId,
      record.displayName,
      record.avatarUrl,
      record.bio,
      (record.preferences!) ?? {},
      record.createdAt,
      record.updatedAt,
    )
  }
}
