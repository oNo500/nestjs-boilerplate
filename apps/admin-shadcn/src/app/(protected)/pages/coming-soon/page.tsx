import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

import { appPaths } from '@/config/app-paths'

export default function ComingSoonPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="max-w-md space-y-8">
        <div className="relative select-none">
          <span className="text-[140px] font-black leading-none tracking-tighter text-muted-foreground/10">
            Soon
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                In progress
              </p>
              <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground">
                Something awesome
                <br />
                is coming
              </h1>
            </div>
          </div>
        </div>

        <p className="text-pretty text-sm text-muted-foreground">
          We&apos;re working hard to bring you something great.
          Check back soon or go back to what you know.
        </p>

        <Button
          render={<Link href={appPaths.dashboard.href} />}
          nativeButton={false}
          variant="outline"
        >
          Back to dashboard
        </Button>
      </div>
    </div>
  )
}
