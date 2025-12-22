import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'

import { AUTH_WRITE_ROUTES } from '@/lib/auth'
import { env } from '@/config/env'
import type { paths } from '@/types/openapi'

// ============================================================================
// Custom Errors
// ============================================================================

// Validation error field type
interface ValidationError {
  field: string
  pointer: string
  code: string
  message: string
}

// RFC 7807 error response (frontend fields only)
interface ProblemDetails {
  detail?: string
  errors?: ValidationError[]
  request_id?: string
  correlation_id?: string
}

export class ApiError extends Error {
  public detail?: string
  public errors?: ValidationError[]
  public requestId?: string

  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'

    // Extract RFC 7807 fields
    const problem = data as ProblemDetails
    this.detail = problem?.detail
    this.errors = problem?.errors
    this.requestId = problem?.request_id ?? problem?.correlation_id
  }
}

// ============================================================================
// Fetch Client
// ============================================================================

// API requests sent directly, proxy.ts handles cookie → bearer header
// baseUrl is empty as OpenAPI paths include /api prefix
export const fetchClient = createFetchClient<paths>({
  baseUrl: '',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Middleware: unified server/client handling
fetchClient.use({
  async onRequest({ request }) {
    if (globalThis.window === undefined) {
      // Server: rewrite URL + manually add token
      const { cookies } = await import('next/headers')
      const cookiesStore = await cookies()
      const token = cookiesStore.get('access_token')?.value

      const url = new URL(request.url, env.API_UPSTREAM_BASE_URL)
      const newRequest = new Request(url, request)
      if (token) {
        newRequest.headers.set('Authorization', `Bearer ${token}`)
      }
      return newRequest
    }
    // Client: no processing, use proxy
    return request
  },
})

// Middleware: 401 intercept and auto token refresh (client only)
fetchClient.use({
  async onResponse({ response, request }) {
    // Server doesn't handle 401 refresh
    if (globalThis.window === undefined) {
      return response
    }
    // On 401 and not auth write route, try refresh token
    if (response.status === 401 && !AUTH_WRITE_ROUTES.some((route) => request.url.includes(route))) {
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (refreshRes.ok) {
        // Refresh success, retry original request
        return fetch(request.clone())
      }
    }
    return response
  },
})

// ============================================================================
// React Query Client
// ============================================================================

export const $api = createClient(fetchClient)
