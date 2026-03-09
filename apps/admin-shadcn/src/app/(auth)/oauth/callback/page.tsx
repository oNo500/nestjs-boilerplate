import { Suspense } from 'react'

import { OAuthCallbackPage } from '@/features/auth/components/oauth-callback'

export default function Page() {
  return (
    <Suspense
      fallback={(
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Completing sign in...</p>
        </div>
      )}
    >
      <OAuthCallbackPage />
    </Suspense>
  )
}
