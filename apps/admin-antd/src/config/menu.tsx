import {
  BarChart2,
  TrendingUp,
  MessageSquare,
  FileText,
  Table2,
  PenLine,
  AlertCircle,
  Timer,
} from 'lucide-react'

import type { TFunction } from 'i18next'
import type { LucideIcon } from 'lucide-react'

export interface MenuItem {
  path?: string
  key?: string
  label: string
  icon?: LucideIcon
  roles?: string[]
  children?: MenuItem[]
}

export function getMenuItems(t: TFunction<'menu'>): MenuItem[] {
  return [
    {
      key: 'dashboards',
      label: t('dashboards._'),
      icon: BarChart2,
      children: [
        {
          path: '/dashboards/analytics',
          label: t('dashboards.analytics'),
          icon: BarChart2,
        },
        {
          path: '/dashboards/crm',
          label: t('dashboards.crm'),
          icon: TrendingUp,
        },
      ],
    },
    {
      key: 'apps',
      label: t('apps._'),
      icon: MessageSquare,
      children: [
        {
          path: '/articles',
          label: t('apps.articles'),
          icon: FileText,
        },
        {
          path: '/apps/chat',
          label: t('apps.chat'),
          icon: MessageSquare,
        },
      ],
    },
    {
      key: 'pages',
      label: t('pages._'),
      icon: AlertCircle,
      children: [
        {
          key: 'pages-tables',
          label: t('pages.tables._'),
          icon: Table2,
          roles: ['ADMIN'],
          children: [
            {
              path: '/users',
              label: t('pages.tables.dataTable'),
              icon: Table2,
              roles: ['ADMIN'],
            },
            {
              path: '/login-logs',
              label: t('pages.tables.filterableTable'),
              icon: Table2,
              roles: ['ADMIN'],
            },
            {
              path: '/audit-logs',
              label: t('pages.tables.sortableTable'),
              icon: Table2,
              roles: ['ADMIN'],
            },
          ],
        },
        {
          key: 'pages-forms',
          label: t('pages.forms._'),
          icon: PenLine,
          children: [
            {
              path: '/settings/general',
              label: t('pages.forms.settingsForm'),
              icon: PenLine,
            },
            {
              path: '/settings/sessions',
              label: t('pages.forms.sessionManager'),
              icon: PenLine,
            },
            {
              path: '/settings/upload-demo',
              label: t('pages.forms.fileUpload'),
              icon: PenLine,
            },
          ],
        },
        {
          path: '/pages/404',
          label: t('pages.notFound'),
          icon: AlertCircle,
        },
        {
          path: '/pages/error',
          label: t('pages.error'),
          icon: AlertCircle,
        },
        {
          path: '/pages/coming-soon',
          label: t('pages.comingSoon'),
          icon: Timer,
        },
      ],
    },
  ]
}
