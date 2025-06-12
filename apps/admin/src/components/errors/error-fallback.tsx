import { Button } from '@repo/ui/components/button';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router';

import { env } from '@/config/env';
import { paths } from '@/config/paths';

import type { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/70 p-10 text-center shadow-xl dark:bg-neutral-900/80">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/80 dark:bg-neutral-800/80">
          <AlertTriangle className="fill-destructive h-8 w-8 dark:text-white" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mb-6 text-base text-neutral-600 dark:text-neutral-300">
          {error.message || 'An unexpected error occurred. Please try refreshing the page.'}
        </p>

        {/* Show error details in development mode */}
        {env.MODE === 'development' && (
          <details className="mb-6 rounded-lg border border-white/10 bg-white/60 p-3 text-left text-xs text-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-200">
            <summary className="mb-2 cursor-pointer text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
              Show error details
            </summary>
            <pre className="scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent max-h-40 overflow-auto whitespace-pre-wrap font-mono text-xs">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="mt-4 flex justify-center gap-4">
          <Button
            variant="ghost"
            asChild
            className="rounded-lg px-6 py-2 font-medium transition-colors duration-200 hover:bg-neutral-200/60 dark:text-white dark:hover:bg-neutral-700/60"
          >
            <Link to={paths.home.getHref()}>Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
