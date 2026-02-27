import { $api, fetchClient } from '@/lib/api'

import type { GetAuditLogsParams } from '@/features/audit-logs/types'

export function useAuditLogs(params: GetAuditLogsParams = {}) {
  return $api.useQuery('get', '/api/audit-logs', { params: { query: params } })
}

export async function getAuditLogs(params: GetAuditLogsParams = {}) {
  const { data } = await fetchClient.GET('/api/audit-logs', { params: { query: params } })
  return data!
}
