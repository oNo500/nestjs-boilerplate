import { env } from '@/config/env';

import type { ErrorInfo } from 'react';

export function logError(error: Error, errorInfo?: ErrorInfo) {
  if (env.MODE === 'development') {
    console.group('🚨 Error Boundary');
    console.error('Error:', error);
    if (errorInfo) {
      console.error('Component Stack:', errorInfo.componentStack);
    }
    console.groupEnd();
  }

  if (env.MODE === 'production') {
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // ignore
    });
  }
}
