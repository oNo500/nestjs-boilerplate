import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { AUTH_WRITE_ROUTES } from '@/lib/auth'
import { env } from '@/config/env'

/**
 * Next.js 16 Proxy Layer
 * Responsibilities:
 * 1. Intercept /api/* requests (except /api/auth/*)
 * 2. Read access_token from Cookie, add Authorization header
 * 3. Rewrite request to backend API
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Auth routes that need to set cookies use route handlers
  if (AUTH_WRITE_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // API requests: cookie → bearer header + rewrite
  if (pathname.startsWith('/api')) {
    const accessToken = request.cookies.get('access_token')?.value
    const requestHeaders = new Headers(request.headers)

    if (accessToken) {
      requestHeaders.set('Authorization', `Bearer ${accessToken}`)
    }

    // Rewrite to backend API, keep path consistent
    const upstreamUrl = new URL(pathname, env.API_UPSTREAM_BASE_URL)
    upstreamUrl.search = request.nextUrl.search

    return NextResponse.rewrite(upstreamUrl, {
      request: { headers: requestHeaders },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
