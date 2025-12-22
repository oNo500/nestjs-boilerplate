import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'

import { AppProvider } from '@/app/provide'

import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import '@workspace/ui/globals.css'
import { $api } from '@/lib/fetch-client'
import { Toaster } from '@workspace/ui/components/ui/sonner'

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
}

export const metadata: Metadata = {
  title: {
    template: '%s · Starter',
    default: 'Starter',
  },
  description: 'Starter template',
}

const Layout = async ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery($api.queryOptions('get', '/api/auth/session'))

  const dehydratedState = dehydrate(queryClient)

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased"
      >
        <AppProvider>
          <HydrationBoundary state={dehydratedState}>
            {children}
            <Toaster />
          </HydrationBoundary>
        </AppProvider>
      </body>
    </html>
  )
}

export default Layout

// Disable pre-rendering, force dynamic execution on each request
// User data depends on cookies, must be fetched at request time
export const dynamic = 'force-dynamic'
