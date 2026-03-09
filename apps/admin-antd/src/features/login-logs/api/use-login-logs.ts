import { fetchClient } from '@/lib/api'

import type { GetLoginLogsParams } from '@/features/login-logs/types'

export async function getLoginLogs(params: GetLoginLogsParams = {}) {
  const { data } = await fetchClient.GET('/api/auth/login-logs', { params: { query: params } })
  return data!
}
