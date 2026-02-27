export interface AuditLogData {
  action: string
  actorId?: string
  actorEmail?: string
  resourceType?: string
  resourceId?: string
  detail?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  requestId?: string
}

export interface AuditLogRecord {
  id: string
  action: string
  actorId: string | null
  actorEmail: string | null
  resourceType: string | null
  resourceId: string | null
  detail: unknown
  ipAddress: string | null
  userAgent: string | null
  requestId: string | null
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
