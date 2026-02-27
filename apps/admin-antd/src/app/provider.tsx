import { StyleProvider } from '@ant-design/cssinjs'
import { ProConfigProvider, enUSIntl, zhCNIntl } from '@ant-design/pro-components'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider as AntdConfigProvider, App as AntdApp } from 'antd'
import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN'
import { useEffect, useMemo } from 'react'
import { I18nextProvider } from 'react-i18next'

import { ErrorBoundary } from '@/components/error-boundary'
import { i18next } from '@/config/i18n'
import { generateThemeConfig } from '@/config/theme'
import { registerMessageInstance } from '@/lib/notification'
import { queryClient } from '@/lib/react-query'
import { useLocaleStore } from '@/stores/use-locale-store'
import { useThemeStore } from '@/stores/use-theme-store'

import { AppInitializer } from './app-initializer'

import type { Language } from '@/config/i18n'
import type { IntlType } from '@ant-design/pro-components'
import type { Locale } from 'antd/lib/locale'

const antdLocaleMap: Record<Language, Locale> = { zh: zhCN, en: enUS }
const proIntlMap: Record<Language, IntlType> = { zh: zhCNIntl, en: enUSIntl }

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
  const language = useLocaleStore((state) => state.language)

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

  const antdLocale = antdLocaleMap[language]
  const proIntl = proIntlMap[language]

  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18next}>
        <QueryClientProvider client={queryClient}>
          <StyleProvider>
            <AntdConfigProvider theme={themeConfig} locale={antdLocale}>
              <ProConfigProvider hashed={false} intl={proIntl}>
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
      </I18nextProvider>
    </ErrorBoundary>
  )
}
