export interface AuditLog {
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
  createdAt: string
}

export interface AuditLogListResponse {
  data: AuditLog[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface GetAuditLogsParams {
  actorId?: string
  action?: string
  page?: number
  page_size?: number
}
