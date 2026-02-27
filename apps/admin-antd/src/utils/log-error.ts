import { env } from '@/config/env'

/**
 * Error logging utility
 *
 * Provides unified handling and recording of application errors
 * with a reserved interface for error reporting services (e.g. Sentry)
 */

interface ErrorLogOptions {
  error: Error
  errorInfo?: React.ErrorInfo
  context?: string
}

/**
 * Log an error to the console and error monitoring service
 *
 * @param options - Error log options
 *
 * @example
 * ```tsx
 * logError({
 *   error: new Error('Failed to load data'),
 *   context: 'UserList',
 * })
 * ```
 */
export function logError({ error, errorInfo, context }: ErrorLogOptions): void {
  // Development: verbose logging
  if (env.isDevelopment) {
    console.group(`🔴 Error${context ? ` in ${context}` : ''}`)
    console.error('Error:', error)
    if (errorInfo) {
      console.error('Component Stack:', errorInfo.componentStack)
    }
    console.groupEnd()
  }

  // Production: report to error monitoring service
  if (env.isProduction) {
    // TODO: integrate error monitoring service (e.g. Sentry)
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo?.componentStack,
    //     },
    //   },
    //   tags: {
    //     context,
    //   },
    // })
  }
}
