'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { MainErrorFallback } from '@/components/errors/main'
import { env } from '@/config/env'
import { queryConfig } from '@/lib/react-query'

interface AppProviderProperties {
  children: React.ReactNode
}

export const AppProvider = ({ children }: AppProviderProperties) => {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: queryConfig,
      }),
  )

  return (
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          {env.NODE_ENV === 'development' && <ReactQueryDevtools />}
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
