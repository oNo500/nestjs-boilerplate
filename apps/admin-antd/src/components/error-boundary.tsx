import { Result, Button } from 'antd'
import { AlertCircle } from 'lucide-react'
import { Component } from 'react'

import { env } from '@/config/env'
import { i18next } from '@/config/i18n'
import { logError } from '@/utils/log-error'

import type { ReactNode } from 'react'

interface ErrorBoundaryProperties {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | undefined
}

/**
 * Generic error boundary component
 *
 * Catches JavaScript errors in the child component tree, displays a friendly error UI,
 * and prevents the entire application from crashing
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * @example Custom error UI
 * ```tsx
 * <ErrorBoundary fallback={<div>Custom error page</div>}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProperties, ErrorBoundaryState> {
  constructor(properties: ErrorBoundaryProperties) {
    super(properties)
    this.state = {
      hasError: false,
      error: undefined,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError({
      error,
      errorInfo,
      context: 'ErrorBoundary',
    })
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
    })

    this.props.onReset?.()
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Result
            icon={<AlertCircle size={72} color="var(--ant-color-error)" />}
            status="error"
            title={i18next.t('common:error.pageErrorTitle')}
            subTitle={env.isDevelopment ? this.state.error?.message : i18next.t('common:error.pageErrorDesc')}
            extra={(
              <Button type="primary" onClick={this.handleReset}>
                {i18next.t('common:error.refresh')}
              </Button>
            )}
          />
        </div>
      )
    }

    return this.props.children
  }
}
