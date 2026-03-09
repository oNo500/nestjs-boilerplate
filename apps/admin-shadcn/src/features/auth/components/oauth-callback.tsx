'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { appPaths } from '@/config/app-paths'
import { setToken, setRefreshToken } from '@/lib/token'

export function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const refreshToken = searchParams.get('refreshToken')

    if (token && refreshToken) {
      setToken(token)
      setRefreshToken(refreshToken)
      router.replace(appPaths.dashboard.href)
    } else {
      router.replace(appPaths.auth.login.getHref())
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Completing sign in...</p>
    </div>
  )
}
