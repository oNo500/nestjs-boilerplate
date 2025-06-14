import * as React from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@repo/ui/components/sidebar';

import { NavMain } from '@/components/layouts/base-layout/nav-main';
import { NavProjects } from '@/components/layouts/base-layout/nav-projects';
import { NavUser } from '@/components/layouts/base-layout/nav-user';
import { TeamSwitcher } from '@/components/layouts/base-layout/team-switcher';

import { menuData } from './menu';

// This is sample menuData.

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavUser user={menuData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
