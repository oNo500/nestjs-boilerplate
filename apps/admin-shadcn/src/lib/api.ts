/**
 * API module exports
 *
 * Type-safe API client based on openapi-fetch + openapi-react-query
 *
 * @example
 * ```tsx
 * import { $api } from '@/lib/api'
 *
 * function UserList() {
 *   const { data } = $api.useQuery('get', '/v1/users')
 *   return <ul>{data?.data.map(user => <li key={user.id}>{user.username}</li>)}</ul>
 * }
 *
 * function CreateUser() {
 *   const mutation = $api.useMutation('post', '/v1/users')
 *   return <button onClick={() => mutation.mutate({ body: { ... } })}>Create</button>
 * }
 * ```
 */

import createQueryClient from 'openapi-react-query'

import { apiClient } from './api-client'

export const $api = createQueryClient(apiClient)

// Re-export types for use in features
export type { paths, components } from '@/types/openapi'

// Re-export the API client (for non-React usage)
export { apiClient } from './api-client'
