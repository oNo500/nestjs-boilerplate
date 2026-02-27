import { QueryErrorResetBoundary } from '@tanstack/react-query'

import { ErrorBoundary } from './error-boundary'

import type { ReactNode } from 'react'

interface QueryErrorBoundaryProperties {
  children: ReactNode
}

/**
 * React Query error boundary component
 *
 * Integrates React Query's QueryErrorResetBoundary to provide a retry mechanism
 * specifically for handling asynchronous request errors
 *
 * @example
 * ```tsx
 * <QueryErrorBoundary>
 *   <UserList />
 * </QueryErrorBoundary>
 * ```
 */
export function QueryErrorBoundary({ children }: QueryErrorBoundaryProperties) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => <ErrorBoundary onReset={reset}>{children}</ErrorBoundary>}
    </QueryErrorResetBoundary>
  )
}
