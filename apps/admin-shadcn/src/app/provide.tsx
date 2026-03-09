'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@workspace/ui/components/sonner'
import { ThemeProvider } from 'next-themes'

import { queryClient } from '@/lib/react-query'

export const AppProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster />
    </ThemeProvider>
  </QueryClientProvider>
)
