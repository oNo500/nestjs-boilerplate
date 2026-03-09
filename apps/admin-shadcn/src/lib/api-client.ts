/**
 * OpenAPI Fetch Client (Client Component)
 *
 * Type-safe HTTP client based on openapi-fetch.
 * For use in Client Components only — uses Bearer Token from localStorage.
 * For Server Components, use fetch-client.ts (Cookie auth, Next.js cache tags).
 */

import createClient from 'openapi-fetch'

import { env } from '@/config/env'
import { ApiClientError } from '@/lib/api-error'
import {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  removeToken,
  removeRefreshToken,
  removeUser,
} from '@/lib/token'

import type { FieldError } from '@/lib/api-error'
import type { paths } from '@/types/openapi'

export const apiClient = createClient<paths>({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  // Delegate to globalThis.fetch at call time so MSW can intercept in tests
  fetch: (...args) => globalThis.fetch(...args),
})

/** Automatically attaches Bearer Token from localStorage */
apiClient.use({
  onRequest: ({ request }) => {
    const token = getToken()
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    return request
  },
})

/** Module-level refresh promise — collapses concurrent 401s into a single refresh call */
let refreshPromise: Promise<boolean> | null = null

async function doRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const res = await globalThis.fetch(`${env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) return false

    const data = (await res.json()) as { accessToken?: string, refreshToken?: string }
    if (data.accessToken) setToken(data.accessToken)
    if (data.refreshToken) setRefreshToken(data.refreshToken)
    return true
  } catch {
    return false
  }
}

/** Handle 401 — attempt token refresh, retry request once; on failure redirect to login */
apiClient.use({
  onResponse: async ({ request, response }) => {
    if (response.status !== 401) {
      if (!response.ok) {
        const data: unknown = await response.clone().json().catch(() => null)
        throw new ApiClientError(
          data && typeof data === 'object'
            ? (data as { title: string, status: number, code?: string, detail?: string, errors?: FieldError[] })
            : { title: 'Request failed', status: response.status },
        )
      }
      return response
    }

    // Collapse concurrent 401s
    refreshPromise ??= doRefresh().finally(() => {
      refreshPromise = null
    })

    const refreshed = await refreshPromise

    if (!refreshed) {
      removeToken()
      removeRefreshToken()
      removeUser()
      if (globalThis.window !== undefined) {
        globalThis.location.href = '/login'
      }
      throw new ApiClientError({ title: 'Session expired', status: 401 })
    }

    // Retry the original request with the new token
    const newToken = getToken()
    const retryRequest = new Request(request)
    if (newToken) retryRequest.headers.set('Authorization', `Bearer ${newToken}`)

    const retryResponse = await globalThis.fetch(retryRequest)
    if (!retryResponse.ok) {
      const data: unknown = await retryResponse.clone().json().catch(() => null)
      throw new ApiClientError(
        data && typeof data === 'object'
          ? (data as { title: string, status: number, code?: string, detail?: string, errors?: FieldError[] })
          : { title: 'Request failed', status: retryResponse.status },
      )
    }
    return retryResponse
  },
})

/** Wrap network errors (ERR_CONNECTION_REFUSED, timeout, etc.) into ApiClientError */
apiClient.use({
  onError: ({ error }) => {
    if (error instanceof ApiClientError) return error
    return new ApiClientError({
      title: error instanceof Error ? error.message : 'Network error',
      status: 0,
    })
  },
})
