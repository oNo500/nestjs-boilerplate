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
  overviewNavItems,
  contentNavItems,
  identityNavItems,
  auditNavItems,
  settingsNavItems,
} from '@/config/app-paths'
import { hasRequiredRole } from '@/lib/rbac'

import { NavMain } from './nav-main'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

import type { NavItem } from '@/config/app-paths'
import type { RoleType } from '@/lib/rbac'

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

function visibleItems(items: NavItem[], userRole: RoleType | null): NavItem[] {
  return items.filter(
    (item) => !item.requiredRole || hasRequiredRole(userRole, item.requiredRole),
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const storedUser = useUser()
  const pathname = usePathname()

  const userRole = storedUser?.role ?? null

  function withActive(items: NavItem[]): NavItem[] {
    return items.map((item) => ({
      ...item,
      isActive:
        pathname === item.url ||
        pathname.startsWith(item.url + '/') ||
        item.items?.some((sub) => pathname === sub.url),
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
        {visibleItems(overviewNavItems, userRole).length > 0 && (
          <NavMain label="Overview" items={withActive(visibleItems(overviewNavItems, userRole))} />
        )}
        {visibleItems(contentNavItems, userRole).length > 0 && (
          <NavMain label="Content" items={withActive(visibleItems(contentNavItems, userRole))} />
        )}
        {visibleItems(identityNavItems, userRole).length > 0 && (
          <NavMain label="Identity" items={withActive(visibleItems(identityNavItems, userRole))} />
        )}
        {visibleItems(auditNavItems, userRole).length > 0 && (
          <NavMain label="Audit" items={withActive(visibleItems(auditNavItems, userRole))} />
        )}
        {visibleItems(settingsNavItems, userRole).length > 0 && (
          <NavMain label="Settings" items={withActive(visibleItems(settingsNavItems, userRole))} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
