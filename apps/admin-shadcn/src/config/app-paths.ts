// Single source of truth for all Next.js route paths

import {
  BarChart2Icon,
  FileTextIcon,
  UsersIcon,
  ShieldCheckIcon,
  ListChecksIcon,
  LogInIcon,
  SettingsIcon,
} from 'lucide-react'

import type { LucideIcon } from 'lucide-react'
import type { RoleType } from '@/lib/rbac'

export const appPaths = {
  home: {
    href: '/',
  },
  dashboard: {
    href: '/dashboards/analytics',
    label: 'Dashboard',
  },
  dashboards: {
    analytics: { href: '/dashboards/analytics', label: 'Dashboard' },
  },
  articles: {
    href: '/articles',
    label: 'Articles',
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
    href: '/settings',
    label: 'Settings',
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
  requiredRole?: RoleType
  items?: { title: string; url: string }[]
}

export const managementNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: appPaths.dashboards.analytics.href,
    icon: BarChart2Icon,
    requiredRole: 'ADMIN',
  },
  {
    title: 'Articles',
    url: appPaths.articles.href,
    icon: FileTextIcon,
    requiredRole: 'ADMIN',
  },
  {
    title: 'Users',
    url: appPaths.users.href,
    icon: UsersIcon,
    requiredRole: 'ADMIN',
  },
  {
    title: 'Roles',
    url: appPaths.roles.href,
    icon: ShieldCheckIcon,
    requiredRole: 'ADMIN',
  },
  {
    title: 'Audit Logs',
    url: appPaths.auditLogs.href,
    icon: ListChecksIcon,
    requiredRole: 'ADMIN',
  },
  {
    title: 'Login Logs',
    url: appPaths.loginLogs.href,
    icon: LogInIcon,
    requiredRole: 'ADMIN',
  },
]

export const settingsNavItems: NavItem[] = [
  {
    title: 'Settings',
    url: appPaths.settings.general.href,
    icon: SettingsIcon,
    items: [
      { title: 'General', url: appPaths.settings.general.href },
      { title: 'Sessions', url: appPaths.settings.sessions.href },
      { title: 'Upload Demo', url: appPaths.settings.uploadDemo.href },
    ],
  },
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
