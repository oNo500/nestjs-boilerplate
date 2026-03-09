export interface LoginLog {
  id: string
  userId: string | null
  email: string
  status: 'success' | 'failed'
  ipAddress: string | null
  userAgent: string | null
  failReason: string | null
  createdAt: string
}

export interface LoginLogListResponse {
  object: 'list'
  data: LoginLog[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface GetLoginLogsParams {
  page?: number
  pageSize?: number
  email?: string
  status?: 'success' | 'failed'
}
