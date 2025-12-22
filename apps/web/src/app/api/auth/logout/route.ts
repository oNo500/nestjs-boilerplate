import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { clearAuthCookies } from '@/lib/auth'
import { env } from '@/config/env'

/**
 * Logout endpoint
 * 1. Call backend logout (optional, continue even if fails)
 * 2. Clear local cookies
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value

  // Call backend logout (optional, continue even if fails)
  if (refreshToken) {
    try {
      await fetch(`${env.API_UPSTREAM_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
    } catch {
      // Ignore error, ensure local logout completes
    }
  }

  const res = NextResponse.json({ success: true })
  clearAuthCookies(res)

  return res
}
