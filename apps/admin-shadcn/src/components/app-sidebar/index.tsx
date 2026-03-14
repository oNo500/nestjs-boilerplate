'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@workspace/ui/components/sidebar'
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import * as React from 'react'

import { useUser } from '@/components/user-provider'
import {
  dashboardNavItems,
  appsNavItems,
  pagesNavItems,
  managementNavItems,
  appPaths,
} from '@/config/app-paths'

import { NavMain } from './nav-main'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

import type { NavItem } from '@/config/app-paths'

/** URLs that require ADMIN role */
const ADMIN_ONLY_URLS = new Set<string>([
  appPaths.loginLogs.href,
  appPaths.auditLogs.href,
  appPaths.roles.href,
])

const teams = [
  {
    name: 'Acme Inc',
    logo: <GalleryVerticalEndIcon />,
    plan: 'Enterprise',
  },
  {
    name: 'Acme Corp.',
    logo: <AudioLinesIcon />,
    plan: 'Startup',
  },
  {
    name: 'Evil Corp.',
    logo: <TerminalIcon />,
    plan: 'Free',
  },
]

function filterByRole(items: NavItem[], isAdmin: boolean): NavItem[] {
  return items.flatMap((item) => {
    if (ADMIN_ONLY_URLS.has(item.url) && !isAdmin) return []
    if (item.items) {
      const filteredSub = item.items.filter((sub) => !ADMIN_ONLY_URLS.has(sub.url) || isAdmin)
      return [{ ...item, items: filteredSub }]
    }
    return [item]
  })
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const storedUser = useUser()
  const pathname = usePathname()

  const isAdmin = storedUser?.role === 'ADMIN'

  function withActive(items: NavItem[]): NavItem[] {
    return items.map((item) => ({
      ...item,
      isActive:
        pathname === item.url
        || pathname.startsWith(item.url + '/')
        || item.items?.some((sub) => pathname === sub.url),
      items: item.items?.map((sub) => ({
        ...sub,
        isActive: pathname === sub.url,
      })),
    }))
  }

  const user = storedUser
    ? {
        name: storedUser.email.split('@')[0] ?? storedUser.email,
        email: storedUser.email,
        avatar: '',
      }
    : { name: 'User', email: '', avatar: '' }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Dashboards" items={withActive(dashboardNavItems)} />
        <NavMain label="Apps" items={withActive(appsNavItems)} />
        <NavMain label="Pages" items={withActive(filterByRole(pagesNavItems, isAdmin))} />
        {isAdmin && <NavMain label="Management" items={withActive(managementNavItems)} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
