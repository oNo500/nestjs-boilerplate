'use client'

import { useEffect } from 'react'

import '@/styles/globals.css'

export default function GlobalError({
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
    <html>
      <body>
        <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
          <div className="max-w-md space-y-8">
            <div className="relative select-none">
              <span className="text-[160px] font-black leading-none tracking-tighter text-muted-foreground/10">
                500
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-widest text-destructive">
                    Critical error
                  </p>
                  <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground">
                    Application failed to load
                  </h1>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-pretty text-sm text-muted-foreground">
                {error.message || 'A critical error occurred. Please refresh the page.'}
              </p>
              {error.digest && (
                <p className="font-mono text-xs text-muted-foreground/60">
                  Error ID:
                  {' '}
                  {error.digest}
                </p>
              )}
            </div>

            <button
              onClick={reset}
              className="rounded-md border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
