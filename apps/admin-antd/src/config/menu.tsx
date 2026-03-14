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

import type { LucideIcon } from 'lucide-react'

export interface MenuItem {
  path?: string
  key?: string
  label: string
  icon?: LucideIcon
  roles?: string[]
  children?: MenuItem[]
}

export function getMenuItems(): MenuItem[] {
  return [
    {
      key: 'dashboards',
      label: 'Dashboards',
      icon: BarChart2,
      children: [
        {
          path: '/dashboards/analytics',
          label: 'Analytics Dashboard',
          icon: BarChart2,
        },
        {
          path: '/dashboards/crm',
          label: 'CRM Dashboard',
          icon: TrendingUp,
        },
      ],
    },
    {
      key: 'apps',
      label: 'Apps',
      icon: MessageSquare,
      children: [
        {
          path: '/articles',
          label: 'Articles',
          icon: FileText,
        },
        {
          path: '/apps/chat',
          label: 'Chat',
          icon: MessageSquare,
        },
      ],
    },
    {
      key: 'pages',
      label: 'Pages',
      icon: AlertCircle,
      children: [
        {
          key: 'pages-tables',
          label: 'Tables',
          icon: Table2,
          roles: ['ADMIN'],
          children: [
            {
              path: '/users',
              label: 'Data Table',
              icon: Table2,
              roles: ['ADMIN'],
            },
            {
              path: '/login-logs',
              label: 'Filterable Table',
              icon: Table2,
              roles: ['ADMIN'],
            },
            {
              path: '/audit-logs',
              label: 'Sortable Table',
              icon: Table2,
              roles: ['ADMIN'],
            },
          ],
        },
        {
          key: 'pages-forms',
          label: 'Forms',
          icon: PenLine,
          children: [
            {
              path: '/settings/general',
              label: 'Settings Form',
              icon: PenLine,
            },
            {
              path: '/settings/sessions',
              label: 'Session Manager',
              icon: PenLine,
            },
            {
              path: '/settings/upload-demo',
              label: 'File Upload',
              icon: PenLine,
            },
          ],
        },
        {
          path: '/pages/404',
          label: '404',
          icon: AlertCircle,
        },
        {
          path: '/pages/error',
          label: 'Error',
          icon: AlertCircle,
        },
        {
          path: '/pages/coming-soon',
          label: 'Coming Soon',
          icon: Timer,
        },
      ],
    },
  ]
}
