/**
 * OpenAPI Fetch Client
 *
 * Type-safe HTTP client based on openapi-fetch
 * Includes authentication, timeout, and error handling middleware
 */

import createClient from 'openapi-fetch'

import { env } from '@/config/env'
import { i18next } from '@/config/i18n'
import { ApiClientError, createDefaultProblem } from '@/lib/api-error'
import { notification } from '@/lib/notification'
import { getToken, setToken, setRefreshToken, getRefreshToken } from '@/lib/token'

import type { ProblemDetails } from '@/lib/api-error'
import type { paths } from '@/types/openapi'

/**
 * Check whether a value is an RFC 9457 Problem Details object
 */
function isProblemDetails(value: unknown): value is ProblemDetails {
  return (
    typeof value === 'object'
    && value !== null
    && 'type' in value
    && 'title' in value
    && 'errors' in value
    && typeof (value as ProblemDetails).type === 'string'
    && typeof (value as ProblemDetails).title === 'string'
    && Array.isArray((value as ProblemDetails).errors)
  )
}

/**
 * Extract an error message from a response body value
 */
function getErrorMessage(value: unknown): string {
  if (typeof value === 'object' && value !== null && 'message' in value) {
    const message = (value as { message: unknown }).message
    return typeof message === 'string' ? message : i18next.t('common:api.requestFailed')
  }
  return i18next.t('common:api.requestFailed')
}

/**
 * Create the openapi-fetch client
 */
export const fetchClient = createClient<paths>({
  baseUrl: env.API_URL,
})

/**
 * Authentication middleware
 * Automatically attaches Bearer Token
 */
fetchClient.use({
  onRequest: ({ request }) => {
    const token = getToken()
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    return request
  },
})

/**
 * Error handling middleware (registered first, executed last in the reversed onResponse chain)
 * Converts non-2xx responses into ApiClientError
 */
fetchClient.use({
  onResponse: async ({ response }) => {
    if (!response.ok) {
      const contentType = response.headers.get('content-type')

      if (
        contentType?.includes('application/json')
        || contentType?.includes('application/problem+json')
      ) {
        try {
          const data: unknown = await response.clone().json()
          if (isProblemDetails(data)) {
            throw new ApiClientError(data)
          }
          throw new ApiClientError(createDefaultProblem(response.status, getErrorMessage(data)))
        } catch (error) {
          if (error instanceof ApiClientError) {
            throw error
          }
          throw new ApiClientError(createDefaultProblem(response.status, i18next.t('common:api.requestFailed')))
        }
      }

      throw new ApiClientError(createDefaultProblem(response.status, i18next.t('common:api.requestFailed')))
    }
    return response
  },
})

/**
 * Token auto-refresh middleware (registered last, executed first in the reversed onResponse chain)
 *
 * Must be registered after the error handling middleware to ensure it runs before error
 * handling in the onResponse chain, allowing it to intercept raw 401 responses, complete
 * the refresh, and then let the error handling middleware process any remaining errors.
 *
 * Intercepts 401 responses, automatically exchanges the refresh token for a new access token,
 * and retries the original request. Uses a Promise queue lock to prevent concurrent duplicate refreshes.
 */
let refreshingPromise: Promise<string> | null = null

fetchClient.use({
  onResponse: async ({ response, request, schemaPath }) => {
    if (response.status !== 401) return response
    // Prevent the refresh endpoint itself from triggering a loop
    if (schemaPath === '/api/auth/refresh-token') return response

    // Promise queue lock: multiple concurrent 401s trigger only one refresh
    // On refresh failure, rejects; side effects (logout) are handled here exactly once
    refreshingPromise ??= (async (): Promise<string> => {
      const refreshToken = getRefreshToken()
      if (!refreshToken) throw new Error('no_refresh_token')

      // Use native fetch to bypass the middleware chain and avoid a circular trigger
      const res = await fetch(`${env.API_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!res.ok) throw new Error('refresh_failed')

      const data = (await res.json()) as { accessToken?: string, refreshToken?: string }
      if (!data.accessToken) throw new Error('no_access_token')

      setToken(data.accessToken)
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken)
      }

      return data.accessToken
    })()
      .catch(async (error: unknown) => {
        // Centralize all side effects of a refresh failure here; executed only once
        const { useAuthStore } = await import('@/features/auth/stores/use-auth-store')
        useAuthStore.getState().logout()
        notification.error(i18next.t('common:api.sessionExpired'))
        globalThis.location.href = '/login'
        throw error
      })
      .finally(() => {
        refreshingPromise = null
      })

    try {
      const newAccessToken = await refreshingPromise
      // Retry the original request with the new token injected
      const retryRequest = new Request(request, {
        headers: new Headers(request.headers),
      })
      retryRequest.headers.set('Authorization', `Bearer ${newAccessToken}`)
      return fetch(retryRequest)
    } catch {
      // Refresh failed: side effects already handled above; return the original 401 response
      return response
    }
  },
})
