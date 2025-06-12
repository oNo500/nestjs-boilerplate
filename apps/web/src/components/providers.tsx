'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';

import { env } from '@/config/env';
import { queryClient } from '@/lib/query-client';
import { VercelAnalytics } from '@/lib/vercel-analytics';

interface ProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        {env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={true} />}
        {env.NODE_ENV === 'production' && <VercelAnalytics />}
      </ThemeProvider>
      {env.NODE_ENV === 'test' && <div data-testid="page-ready" />}
    </QueryClientProvider>
  );
}
