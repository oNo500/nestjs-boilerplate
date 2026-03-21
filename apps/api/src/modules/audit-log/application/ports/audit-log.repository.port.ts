export interface AuditLogData {
  action: string
  actorId?: string
  actorEmail?: string
  actorName?: string
  resourceType?: string
  resourceId?: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  detail?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  requestId?: string
  occurredAt?: Date
}

export interface AuditLogRecord {
  id: string
  action: string
  actorId: string | null
  actorEmail: string | null
  actorName: string | null
  resourceType: string | null
  resourceId: string | null
  before: unknown
  after: unknown
  detail: unknown
  ipAddress: string | null
  userAgent: string | null
  requestId: string | null
  occurredAt: Date | null
  createdAt: Date
}

export interface AuditLogListQuery {
  page: number
  pageSize: number
  actorId?: string
  action?: string
}

export interface AuditLogListResult {
  data: AuditLogRecord[]
  total: number
}

export interface AuditLogRepository {
  create(data: AuditLogData): Promise<void>
  findAll(query: AuditLogListQuery): Promise<AuditLogListResult>
}

export const AUDIT_LOG_REPOSITORY = Symbol('AUDIT_LOG_REPOSITORY')
