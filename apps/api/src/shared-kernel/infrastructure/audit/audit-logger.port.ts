export const AUDIT_LOGGER = Symbol('AUDIT_LOGGER')

export interface AuditLogger {
  log(data: {
    action: string
    actorId?: string
    actorEmail?: string
    resourceId?: string
    resourceType?: string
    detail?: Record<string, unknown>
  }): Promise<void>
}
