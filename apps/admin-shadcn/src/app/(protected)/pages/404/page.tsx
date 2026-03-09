import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

import { BackButton } from '@/components/back-button'
import { appPaths } from '@/config/app-paths'

export default function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="max-w-md space-y-8">
        <div className="relative select-none">
          <span className="text-[160px] font-black leading-none tracking-tighter text-muted-foreground/10">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Page not found
              </p>
              <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground">
                Oops! Wrong turn.
              </h1>
            </div>
          </div>
        </div>

        <p className="text-pretty text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Double-check the URL or head back to safety.
        </p>

        <div className="flex justify-center gap-3">
          <Button
            render={<Link href={appPaths.dashboard.href} />}
            nativeButton={false}
          >
            Back to dashboard
          </Button>
          <BackButton />
        </div>
      </div>
    </div>
  )
}
