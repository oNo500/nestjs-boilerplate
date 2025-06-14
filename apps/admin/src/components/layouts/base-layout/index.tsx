import { SidebarInset, SidebarProvider } from '@repo/ui/components/sidebar';
import { Outlet, useMatches } from 'react-router';

import { AppSidebar } from './app-sidebar';
import Header from './header';

const BaseLayout = () => {
  const matches = useMatches();
  const current = matches[matches.length - 1] as { handle: { title: string } };
  const title = current?.handle?.title;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header title={title} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default BaseLayout;
