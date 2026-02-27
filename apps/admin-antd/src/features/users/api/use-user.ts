import { $api } from '@/lib/api'

export function useUser(id: string) {
  return $api.useQuery('get', '/api/users/{id}', { params: { path: { id } } })
}
