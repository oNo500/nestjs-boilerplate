export const LOGIN_LOG_REPOSITORY = Symbol('LOGIN_LOG_REPOSITORY')

export interface LoginLogEntry {
  userId?: string
  email: string
  status: 'success' | 'failed'
  ipAddress?: string
  userAgent?: string
  failReason?: string
}

export interface LoginLogRecord {
  id: string
  userId: string | null
  email: string
  status: 'success' | 'failed'
  ipAddress: string | null
  userAgent: string | null
  failReason: string | null
  createdAt: Date
}

export interface LoginLogQueryParams {
  page: number
  pageSize: number
  email?: string
  status?: 'success' | 'failed'
}

export interface LoginLogRepository {
  create(entry: LoginLogEntry): Promise<void>
  findAll(params: LoginLogQueryParams): Promise<{ data: LoginLogRecord[], total: number }>
}
