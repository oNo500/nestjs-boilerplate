'use client'

import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { useEffect } from 'react'

import { appPaths } from '@/config/app-paths'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-8">
        {/* Large decorative background number */}
        <div className="relative select-none">
          <span className="text-[160px] font-black leading-none tracking-tighter text-muted-foreground/10">
            500
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-widest text-destructive">
                Something went wrong
              </p>
              <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground">
                Unexpected error
              </h1>
            </div>
          </div>
        </div>

        {/* Error details */}
        <div className="space-y-2">
          <p className="text-pretty text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred. Please try again or return to the homepage.'}
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-muted-foreground/60">
              Error ID:
              {' '}
              {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button
            render={<Link href={appPaths.home.href} />}
            nativeButton={false}
            variant="outline"
          >
            Back to home
          </Button>
        </div>
      </div>
    </div>
  )
}
