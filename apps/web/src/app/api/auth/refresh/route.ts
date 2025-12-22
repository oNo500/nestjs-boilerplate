import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { clearAuthCookies, proxyAuthRequest, setAuthCookies } from '@/lib/auth'
import type { RefreshResponse } from '@/types/auth'

/**
 * Token refresh endpoint
 * 1. Use refresh_token to get new tokens
 * 2. Update cookies
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
  }

  const { data, ok } = await proxyAuthRequest<RefreshResponse>(
    '/api/auth/refresh-token',
    { refreshToken },
  )

  if (!ok) {
    const res = NextResponse.json({ error: 'Refresh failed' }, { status: 401 })
    clearAuthCookies(res)
    return res
  }

  const res = NextResponse.json({ success: true })
  setAuthCookies(res, data)

  return res
}
