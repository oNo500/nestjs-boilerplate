import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { proxyAuthRequest, setAuthCookies } from '@/lib/auth'
import type { AuthResponse, RegisterRequest } from '@/types/auth'

/**
 * Register endpoint
 * 1. Forward register request to backend
 * 2. Set HttpOnly Cookie
 * 3. Return user info (auto login after registration)
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as RegisterRequest

  const { data, ok, status } = await proxyAuthRequest<AuthResponse>(
    '/api/auth/register',
    body,
  )

  if (!ok) {
    return NextResponse.json(data, { status })
  }

  const res = NextResponse.json({ user: data.user })
  setAuthCookies(res, data)

  return res
}
