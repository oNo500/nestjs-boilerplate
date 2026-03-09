import { env } from '@/config/env'

import { AppProvider } from './provide'

import type { Metadata } from 'next'

import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: env.NEXT_PUBLIC_APP_NAME,
    template: `%s | ${env.NEXT_PUBLIC_APP_NAME}`,
  },
  description: 'A minimal foundation.',
  openGraph: {
    type: 'website',
    siteName: env.NEXT_PUBLIC_APP_NAME,
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#09090b" />
      </head>
      <body className="grid min-h-dvh antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
