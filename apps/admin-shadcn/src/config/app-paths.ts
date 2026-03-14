// Single source of truth for all Next.js route paths

import {
  BarChart2Icon,
  TrendingUpIcon,
  FileTextIcon,
  MessageSquareIcon,
  AlertCircleIcon,
  TimerIcon,
  TableIcon,
  ClipboardPenIcon,
  ShieldCheckIcon,
} from 'lucide-react'

import type { LucideIcon } from 'lucide-react'

export const appPaths = {
  home: {
    href: '/',
  },
  dashboard: {
    href: '/dashboards/analytics',
    label: 'Analytics Dashboard',
  },
  dashboards: {
    analytics: { href: '/dashboards/analytics', label: 'Analytics Dashboard' },
    crm: { href: '/dashboards/crm', label: 'CRM Dashboard' },
  },
  apps: {
    chat: { href: '/apps/chat', label: 'Chat' },
  },
  articles: {
    href: '/articles',
    label: 'Articles',
  },
  pages: {
    notFound: { href: '/pages/404', label: '404' },
    error: { href: '/pages/error', label: 'Error' },
    comingSoon: { href: '/pages/coming-soon', label: 'Coming Soon' },
  },
  auth: {
    register: {
      getHref: (redirectTo?: string | null) =>
        `/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    login: {
      getHref: (redirectTo?: string | null) =>
        `/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  },
  users: {
    href: '/users',
    label: 'Users',
  },
  roles: {
    href: '/roles',
    label: 'Roles',
  },
  loginLogs: {
    href: '/login-logs',
    label: 'Login Logs',
  },
  auditLogs: {
    href: '/audit-logs',
    label: 'Audit Logs',
  },
  settings: {
    href: '/settings', label: 'Settings',
    general: { href: '/settings/general', label: 'General' },
    sessions: { href: '/settings/sessions', label: 'Sessions' },
    uploadDemo: { href: '/settings/upload-demo', label: 'Upload Demo' },
  },
} as const

export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: { title: string, url: string }[]
}

export const dashboardNavItems: NavItem[] = [
  {
    title: 'Analytics Dashboard',
    url: appPaths.dashboards.analytics.href,
    icon: BarChart2Icon,
  },
  {
    title: 'CRM Dashboard',
    url: appPaths.dashboards.crm.href,
    icon: TrendingUpIcon,
  },
]

export const appsNavItems: NavItem[] = [
  {
    title: 'Articles',
    url: appPaths.articles.href,
    icon: FileTextIcon,
  },
  {
    title: 'Chat',
    url: appPaths.apps.chat.href,
    icon: MessageSquareIcon,
  },
]

export const pagesNavItems: NavItem[] = [
  {
    title: 'Tables',
    url: appPaths.users.href,
    icon: TableIcon,
    items: [
      { title: 'Data Table', url: appPaths.users.href },
      { title: 'Filterable Table', url: appPaths.loginLogs.href },
      { title: 'Sortable Table', url: appPaths.auditLogs.href },
    ],
  },
  {
    title: 'Forms',
    url: appPaths.settings.general.href,
    icon: ClipboardPenIcon,
    items: [
      { title: 'Settings Form', url: appPaths.settings.general.href },
      { title: 'Session Manager', url: appPaths.settings.sessions.href },
      { title: 'File Upload', url: appPaths.settings.uploadDemo.href },
    ],
  },
  {
    title: '404',
    url: appPaths.pages.notFound.href,
    icon: AlertCircleIcon,
  },
  {
    title: 'Error',
    url: appPaths.pages.error.href,
    icon: AlertCircleIcon,
  },
  {
    title: 'Coming Soon',
    url: appPaths.pages.comingSoon.href,
    icon: TimerIcon,
  },
]

export const managementNavItems: NavItem[] = [
  {
    title: 'Roles',
    url: appPaths.roles.href,
    icon: ShieldCheckIcon,
  },
]

// Kept for backwards compatibility
export const navItems: NavItem[] = [
  ...dashboardNavItems,
  ...appsNavItems,
  ...pagesNavItems,
  ...managementNavItems,
]

function kebabToCamel(str: string): string {
  return str.replaceAll(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

// Walk the appPaths tree by href segments to resolve a label (used for breadcrumbs)
export function getLabelByHref(href: string): string | undefined {
  const segments = href.split('/').filter(Boolean)
  let node: Record<string, unknown> = appPaths
  for (const segment of segments) {
    node = node[kebabToCamel(segment)] as Record<string, unknown>
    if (!node) return undefined
  }
  return typeof node.label === 'string' ? node.label : undefined
}
