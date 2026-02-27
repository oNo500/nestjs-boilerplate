import { $api, fetchClient } from '@/lib/api'

import type { GetUsersParams } from '@/features/users/types'

export function useUsers(params: GetUsersParams = {}) {
  return $api.useQuery('get', '/api/users', { params: { query: params } })
}

export async function getUsers(params: GetUsersParams = {}) {
  const { data } = await fetchClient.GET('/api/users', { params: { query: params } })
  return data!
}
