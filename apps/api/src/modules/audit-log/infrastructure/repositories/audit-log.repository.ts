import { Inject, Injectable } from '@nestjs/common'
import { auditLogsTable } from '@workspace/database'
import { and, count, desc, eq } from 'drizzle-orm'

import { DB_TOKEN } from '@/app/database/db.port'

import type { DrizzleDb } from '@/app/database/db.port'
import type {
  AuditLogData,
  AuditLogListQuery,
  AuditLogListResult,
  AuditLogRecord,
  AuditLogRepository,
} from '@/modules/audit-log/application/ports/audit-log.repository.port'

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
      actorName: data.actorName ?? null,
      resourceType: data.resourceType ?? null,
      resourceId: data.resourceId ?? null,
      before: data.before ?? null,
      after: data.after ?? null,
      detail: data.detail ?? null,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      requestId: data.requestId ?? null,
      occurredAt: data.occurredAt ?? null,
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
      actorName: row.actorName,
      resourceType: row.resourceType,
      resourceId: row.resourceId,
      before: row.before,
      after: row.after,
      detail: row.detail,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      requestId: row.requestId,
      occurredAt: row.occurredAt,
      createdAt: row.createdAt,
    }))

    return {
      data,
      total: totalResult[0]?.count ?? 0,
    }
  }
}
