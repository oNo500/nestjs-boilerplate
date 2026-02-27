import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import enAuditLogs from '@/locales/en/audit-logs.json'
import enAuth from '@/locales/en/auth.json'
import enCommon from '@/locales/en/common.json'
import enMenu from '@/locales/en/menu.json'
import enProfile from '@/locales/en/profile.json'
import enRoles from '@/locales/en/roles.json'
import enScaffold from '@/locales/en/scaffold.json'
import enUsers from '@/locales/en/users.json'
import zhAuditLogs from '@/locales/zh/audit-logs.json'
import zhAuth from '@/locales/zh/auth.json'
import zhCommon from '@/locales/zh/common.json'
import zhMenu from '@/locales/zh/menu.json'
import zhProfile from '@/locales/zh/profile.json'
import zhRoles from '@/locales/zh/roles.json'
import zhScaffold from '@/locales/zh/scaffold.json'
import zhUsers from '@/locales/zh/users.json'

export type Language = 'zh' | 'en'

export const defaultNS = 'common' as const

export const resources = {
  zh: {
    'common': zhCommon,
    'menu': zhMenu,
    'auth': zhAuth,
    'users': zhUsers,
    'roles': zhRoles,
    'audit-logs': zhAuditLogs,
    'profile': zhProfile,
    'scaffold': zhScaffold,
  },
  en: {
    'common': enCommon,
    'menu': enMenu,
    'auth': enAuth,
    'users': enUsers,
    'roles': enRoles,
    'audit-logs': enAuditLogs,
    'profile': enProfile,
    'scaffold': enScaffold,
  },
} as const

void i18next.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  defaultNS,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})

export { default as i18next } from 'i18next'
