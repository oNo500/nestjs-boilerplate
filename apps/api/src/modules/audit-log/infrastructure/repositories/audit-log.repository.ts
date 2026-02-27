import { Inject, Injectable } from '@nestjs/common'
import { auditLogsTable } from '@workspace/database'
import { and, count, desc, eq } from 'drizzle-orm'

import { DB_TOKEN } from '@/shared-kernel/infrastructure/db/db.port'

import type {
  AuditLogData,
  AuditLogListQuery,
  AuditLogListResult,
  AuditLogRecord,
  AuditLogRepository,
} from '@/modules/audit-log/application/ports/audit-log.repository.port'
import type { DrizzleDb } from '@/shared-kernel/infrastructure/db/db.port'

@Injectable()
export class AuditLogRepositoryImpl implements AuditLogRepository {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: DrizzleDb,
  ) {}

  async create(data: AuditLogData): Promise<void> {
    await this.db.insert(auditLogsTable).values({
      action: data.action,
      actorId: data.actorId ?? null,
      actorEmail: data.actorEmail ?? null,
      resourceType: data.resourceType ?? null,
      resourceId: data.resourceId ?? null,
      detail: data.detail ?? null,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      requestId: data.requestId ?? null,
    })
  }

  async findAll(query: AuditLogListQuery): Promise<AuditLogListResult> {
    const { page, pageSize, actorId, action } = query

    const conditions = []
    if (actorId) {
      conditions.push(eq(auditLogsTable.actorId, actorId))
    }
    if (action) {
      conditions.push(eq(auditLogsTable.action, action))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(auditLogsTable)
        .where(whereClause)
        .orderBy(desc(auditLogsTable.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      this.db
        .select({ count: count() })
        .from(auditLogsTable)
        .where(whereClause),
    ])

    const data: AuditLogRecord[] = rows.map((row) => ({
      id: row.id,
      action: row.action,
      actorId: row.actorId,
      actorEmail: row.actorEmail,
      resourceType: row.resourceType,
      resourceId: row.resourceId,
      detail: row.detail,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      requestId: row.requestId,
      createdAt: row.createdAt,
    }))

    return {
      data,
      total: totalResult[0]?.count ?? 0,
    }
  }
}
