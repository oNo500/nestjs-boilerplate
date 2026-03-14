import { StyleProvider } from '@ant-design/cssinjs'
import { ProConfigProvider, enUSIntl } from '@ant-design/pro-components'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider as AntdConfigProvider, App as AntdApp } from 'antd'
import enUS from 'antd/locale/en_US'
import { useEffect, useMemo } from 'react'

import { ErrorBoundary } from '@/components/error-boundary'
import { generateThemeConfig } from '@/config/theme'
import { registerMessageInstance } from '@/lib/notification'
import { queryClient } from '@/lib/react-query'
import { useThemeStore } from '@/stores/use-theme-store'

import { AppInitializer } from './app-initializer'

function NotificationRegistrar() {
  const { message } = AntdApp.useApp()
  useEffect(() => {
    registerMessageInstance(message)
  }, [message])
  return null
}

interface AppProviderProperties {
  children: React.ReactNode
}

export function AppProvider({ children }: AppProviderProperties) {
  const isDark = useThemeStore((state) => state.isDark)
  const colorPrimary = useThemeStore((state) => state.colorPrimary)
  const borderRadius = useThemeStore((state) => state.borderRadius)
  const compact = useThemeStore((state) => state.compact)

  const themeConfig = useMemo(
    () =>
      generateThemeConfig({
        isDark,
        colorPrimary,
        borderRadius,
        compact,
      }),
    [isDark, colorPrimary, borderRadius, compact],
  )

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <StyleProvider>
          <AntdConfigProvider theme={themeConfig} locale={enUS}>
            <ProConfigProvider hashed={false} intl={enUSIntl}>
              <AntdApp>
                <NotificationRegistrar />
                <AppInitializer>
                  {children}
                </AppInitializer>
              </AntdApp>
            </ProConfigProvider>
          </AntdConfigProvider>
        </StyleProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
