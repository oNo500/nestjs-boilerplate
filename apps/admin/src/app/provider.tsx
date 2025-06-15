import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@repo/ui/components/sonner';

import { ErrorFallback } from '@/components/errors/error-fallback';
import { env } from '@/config/env';
import { logError } from '@/lib/error-handling';
import { queryClient } from '@/lib/query-client';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={logError}
        onReset={() => {
          queryClient.clear();
        }}
      >
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
          {env.MODE === 'development' && <ReactQueryDevtools />}
          <Toaster />
        </QueryClientProvider>
      </ErrorBoundary>
    </Suspense>
  );
};
