import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

import { appPaths } from '@/config/app-paths'

export default function ErrorPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="max-w-md space-y-8">
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

        <div className="space-y-2">
          <p className="text-pretty text-sm text-muted-foreground">
            An unexpected error occurred. Please try again or return to the dashboard.
          </p>
          <p className="font-mono text-xs text-muted-foreground/60">
            Error ID: abc123xyz
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Button>Try again</Button>
          <Button
            render={<Link href={appPaths.dashboard.href} />}
            nativeButton={false}
            variant="outline"
          >
            Back to dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
