import type { NextResponse } from 'next/server'

import { env } from '@/config/env'
import type { AuthTokens } from '@/types/auth'

/**
 * Auth routes that need to set cookies
 * These routes use route handlers, not proxy
 */
export const AUTH_WRITE_ROUTES = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/api/auth/register',
] as const

/**
 * Auth cookie configuration
 */
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

/**
 * Proxy auth request to backend
 */
export async function proxyAuthRequest<T>(
  path: string,
  body: unknown,
): Promise<{ data: T, ok: boolean, status: number }> {
  const response = await fetch(`${env.API_UPSTREAM_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = (await response.json()) as T

  return {
    data,
    ok: response.ok,
    status: response.status,
  }
}

/**
 * Set auth cookies
 */
export function setAuthCookies(response: NextResponse, tokens: AuthTokens) {
  response.cookies.set('access_token', tokens.accessToken, AUTH_COOKIE_OPTIONS)
  response.cookies.set(
    'refresh_token',
    tokens.refreshToken,
    AUTH_COOKIE_OPTIONS,
  )
}

/**
 * Clear auth cookies
 */
export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('access_token')
  response.cookies.delete('refresh_token')
}
