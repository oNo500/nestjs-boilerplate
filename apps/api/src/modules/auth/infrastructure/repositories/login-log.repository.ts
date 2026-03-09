import { randomUUID } from 'node:crypto'

import { Inject, Injectable } from '@nestjs/common'
import { loginLogsTable } from '@workspace/database'
import { count, eq, ilike, and } from 'drizzle-orm'

import { DB_TOKEN } from '@/shared-kernel/infrastructure/db/db.port'

import type { LoginLogEntry, LoginLogRecord, LoginLogQueryParams, LoginLogRepository } from '@/modules/auth/application/ports/login-log.repository.port'
import type { DrizzleDb } from '@/shared-kernel/infrastructure/db/db.port'
import type { SQL } from 'drizzle-orm'

@Injectable()
export class LoginLogRepositoryImpl implements LoginLogRepository {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: DrizzleDb,
  ) {}

  async create(entry: LoginLogEntry): Promise<void> {
    await this.db.insert(loginLogsTable).values({
      id: randomUUID(),
      userId: entry.userId ?? null,
      email: entry.email,
      status: entry.status,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
      failReason: entry.failReason ?? null,
    })
  }

  async findAll(params: LoginLogQueryParams): Promise<{ data: LoginLogRecord[], total: number }> {
    const { page, pageSize, email, status } = params
    const offset = (page - 1) * pageSize

    const conditions: SQL[] = []
    if (email) {
      conditions.push(ilike(loginLogsTable.email, `%${email}%`))
    }
    if (status) {
      conditions.push(eq(loginLogsTable.status, status))
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [rows, countRows] = await Promise.all([
      this.db
        .select()
        .from(loginLogsTable)
        .where(where)
        .orderBy(loginLogsTable.createdAt)
        .limit(pageSize)
        .offset(offset),
      this.db
        .select({ total: count() })
        .from(loginLogsTable)
        .where(where),
    ])
    const total = Number(countRows[0]?.total ?? 0)

    return {
      data: rows as LoginLogRecord[],
      total,
    }
  }
}
