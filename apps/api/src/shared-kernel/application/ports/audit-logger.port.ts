export const AUDIT_LOGGER = Symbol('AUDIT_LOGGER')

export interface AuditLogInput {
  action: string
  actorId?: string
  actorEmail?: string
  actorName?: string
  resourceId?: string
  resourceType?: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  detail?: Record<string, unknown>
  occurredAt?: Date
}

export interface AuditLogger {
  log(data: AuditLogInput): Promise<void>
}
