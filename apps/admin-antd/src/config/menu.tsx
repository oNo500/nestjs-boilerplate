import {
  Home,
  Users,
  Palette,
  ShieldCheck,
  ScrollText,
  Server,
  LayoutList,
  FileText,
  LayoutGrid,
  Smile,
  TriangleAlert,
  BookOpen,
  FormInput,
  List,
  FileSearch,
  User,
  CheckCircle,
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
      key: 'dashboard',
      label: t('dashboard._'),
      icon: Home,
      children: [
        {
          path: '/dashboard/analysis',
          label: t('dashboard.analysis'),
          icon: Home,
        },
        {
          path: '/dashboard/monitor',
          label: t('dashboard.monitor'),
          icon: Home,
        },
        {
          path: '/dashboard/workplace',
          label: t('dashboard.workplace'),
          icon: Home,
        },
      ],
    },
    {
      key: 'form',
      label: t('form._'),
      icon: FormInput,
      children: [
        {
          path: '/form/basic',
          label: t('form.basic'),
          icon: FileText,
        },
        {
          path: '/form/step',
          label: t('form.step'),
          icon: FileText,
        },
        {
          path: '/form/advanced',
          label: t('form.advanced'),
          icon: FileText,
        },
      ],
    },
    {
      key: 'list',
      label: t('list._'),
      icon: List,
      children: [
        {
          key: 'list-search',
          label: t('list.search._'),
          icon: FileSearch,
          children: [
            { path: '/list/search/articles', label: t('list.search.articles'), icon: FileText },
            { path: '/list/search/projects', label: t('list.search.projects'), icon: LayoutGrid },
            { path: '/list/search/applications', label: t('list.search.applications'), icon: Server },
          ],
        },
        {
          path: '/list/table',
          label: t('list.table'),
          icon: LayoutList,
        },
        {
          path: '/list/basic',
          label: t('list.basic'),
          icon: LayoutList,
        },
        {
          path: '/list/table-list',
          label: t('list.tableList'),
          icon: LayoutList,
        },
      ],
    },
    {
      key: 'profile',
      label: t('profile._'),
      icon: FileSearch,
      children: [
        {
          path: '/profile/basic',
          label: t('profile.basic'),
          icon: FileText,
        },
        {
          path: '/profile/advanced',
          label: t('profile.advanced'),
          icon: FileText,
        },
      ],
    },
    {
      key: 'account',
      label: t('account._'),
      icon: User,
      children: [
        {
          path: '/account/center',
          label: t('account.center'),
          icon: User,
        },
        {
          path: '/account/settings',
          label: t('account.settings'),
          icon: User,
        },
      ],
    },
    {
      key: 'result',
      label: t('result._'),
      icon: CheckCircle,
      children: [
        {
          path: '/result/success',
          label: t('result.success'),
          icon: CheckCircle,
        },
        {
          path: '/result/fail',
          label: t('result.fail'),
          icon: CheckCircle,
        },
      ],
    },
    {
      key: 'system',
      label: t('system._'),
      icon: Server,
      roles: ['ADMIN'],
      children: [
        {
          path: '/system/users',
          label: t('system.users'),
          icon: Users,
          roles: ['ADMIN'],
        },
        {
          path: '/system/roles',
          label: t('system.roles'),
          icon: ShieldCheck,
          roles: ['ADMIN'],
        },
        {
          path: '/system/audit-logs',
          label: t('system.auditLogs'),
          icon: ScrollText,
          roles: ['ADMIN'],
        },
      ],
    },
    {
      key: 'foundation',
      label: t('foundation._'),
      icon: Palette,
      children: [
        {
          path: '/foundation/components',
          label: t('foundation.components'),
          icon: LayoutGrid,
        },
        {
          path: '/foundation/icons',
          label: t('foundation.icons'),
          icon: Smile,
        },
      ],
    },
    {
      key: 'exception',
      label: t('exception._'),
      icon: TriangleAlert,
      children: [
        {
          path: '/exception/403',
          label: t('exception.e403'),
        },
        {
          path: '/exception/404',
          label: t('exception.e404'),
        },
        {
          path: '/exception/500',
          label: t('exception.e500'),
        },
        {
          path: '/exception/empty',
          label: t('exception.empty'),
        },
      ],
    },
    {
      path: '/docs',
      label: t('docs'),
      icon: BookOpen,
    },
  ]
}
