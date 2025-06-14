import * as React from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@repo/ui/components/sidebar';

import { NavMain } from '@/components/layouts/base-layout/nav-main';
import { NavProjects } from '@/components/layouts/base-layout/nav-projects';
import { NavUser } from '@/components/layouts/base-layout/nav-user';
import { TeamSwitcher } from '@/components/layouts/base-layout/team-switcher';
import { authStore } from '@/auth/auth-store';

import { menuData } from './menu';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = authStore();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={menuData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menuData.navMain} />
        <NavProjects projects={menuData.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ ...menuData.user, ...user }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
