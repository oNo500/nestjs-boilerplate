import { randomUUID } from 'node:crypto'

import { Inject, Injectable } from '@nestjs/common'
import { verificationsTable } from '@workspace/database'
import { eq, lt } from 'drizzle-orm'

import { DB_TOKEN } from '@/shared-kernel/infrastructure/db/db.port'

import type {
  VerificationToken,
  VerificationTokenRepository,
} from '@/modules/auth/application/ports/verification-token.repository.port'
import type { DrizzleDb } from '@/shared-kernel/infrastructure/db/db.port'

/**
 * Drizzle VerificationToken Repository implementation
 *
 * Manages temporary verification token persistence
 * Compatible with better-auth verifications table
 * Feature: Only one valid token per identifier
 */
@Injectable()
export class VerificationTokenRepositoryImpl
implements VerificationTokenRepository {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: DrizzleDb,
  ) {}

  async create(data: {
    identifier: string
    value: string
    expiresAt: Date
  }): Promise<VerificationToken> {
    // Delete old token for same identifier first
    await this.deleteByIdentifier(data.identifier)

    // Create new token
    const result = await this.db
      .insert(verificationsTable)
      .values({
        id: randomUUID(),
        identifier: data.identifier.toLowerCase(),
        value: data.value,
        expiresAt: data.expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    const record = result[0]!
    return this.toEntity(record)
  }

  async findByValue(value: string): Promise<VerificationToken | null> {
    const result = await this.db
      .select()
      .from(verificationsTable)
      .where(eq(verificationsTable.value, value))
      .limit(1)

    if (result.length === 0) {
      return null
    }

    return this.toEntity(result[0]!)
  }

  async findByIdentifier(identifier: string): Promise<VerificationToken | null> {
    const result = await this.db
      .select()
      .from(verificationsTable)
      .where(eq(verificationsTable.identifier, identifier.toLowerCase()))
      .limit(1)

    if (result.length === 0) {
      return null
    }

    return this.toEntity(result[0]!)
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(verificationsTable)
      .where(eq(verificationsTable.id, id))

    return (result.rowCount ?? 0) > 0
  }

  async deleteByIdentifier(identifier: string): Promise<boolean> {
    const result = await this.db
      .delete(verificationsTable)
      .where(eq(verificationsTable.identifier, identifier.toLowerCase()))

    return (result.rowCount ?? 0) > 0
  }

  async deleteExpired(): Promise<number> {
    const result = await this.db
      .delete(verificationsTable)
      .where(lt(verificationsTable.expiresAt, new Date()))

    return result.rowCount ?? 0
  }

  async isValid(value: string): Promise<boolean> {
    const record = await this.findByValue(value)
    if (!record) {
      return false
    }
    return record.expiresAt > new Date()
  }

  private toEntity(
    record: typeof verificationsTable.$inferSelect,
  ): VerificationToken {
    return {
      id: record.id,
      identifier: record.identifier,
      value: record.value,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    }
  }
}
