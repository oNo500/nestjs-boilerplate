import { Inject, Injectable } from '@nestjs/common'
import { jobsTable } from '@workspace/database'
import { eq } from 'drizzle-orm'

import { DB_TOKEN } from '@/shared-kernel/infrastructure/db/db.port'

import type { Job, JobRepository, JobStatus } from '@/modules/order/application/ports/job.repository.port'
import type { DrizzleDb } from '@/shared-kernel/infrastructure/db/db.port'
import type { JobDatabase } from '@workspace/database'

/**
 * Job Repository Drizzle implementation
 */
@Injectable()
export class JobRepositoryImpl implements JobRepository {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDb) {}

  async findById(id: string): Promise<Job | null> {
    const [row] = await this.db.select().from(jobsTable).where(eq(jobsTable.id, id))
    return row ? this.toDomain(row) : null
  }

  async create(job: Omit<Job, 'createdAt' | 'updatedAt'>): Promise<Job> {
    const [row] = await this.db
      .insert(jobsTable)
      .values({
        id: job.id,
        type: job.type,
        status: job.status,
        payload: job.payload,
        result: job.result ?? null,
        error: job.error ?? null,
      })
      .returning()

    return this.toDomain(row!)
  }

  async updateStatus(
    id: string,
    status: JobStatus,
    result?: unknown,
    error?: { code: string, message: string },
  ): Promise<void> {
    await this.db
      .update(jobsTable)
      .set({
        status,
        result: result ?? null,
        error: error ?? null,
        updatedAt: new Date(),
      })
      .where(eq(jobsTable.id, id))
  }

  private toDomain(row: JobDatabase): Job {
    return {
      id: row.id,
      type: row.type,
      status: row.status as JobStatus,
      payload: row.payload as Record<string, unknown>,
      result: row.result ?? null,
      error: row.error as { code: string, message: string } | null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
