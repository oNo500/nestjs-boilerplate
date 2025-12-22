import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { proxyAuthRequest, setAuthCookies } from '@/lib/auth'
import type { AuthResponse, LoginRequest } from '@/types/auth'

/**
 * Login endpoint
 * 1. Forward login request to backend
 * 2. Set HttpOnly Cookie
 * 3. Return user info
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as LoginRequest

  const { data, ok, status } = await proxyAuthRequest<AuthResponse>(
    '/api/auth/login',
    body,
  )

  if (!ok) {
    return NextResponse.json(data, { status })
  }

  const res = NextResponse.json({ user: data.user })
  setAuthCookies(res, data)

  return res
}
