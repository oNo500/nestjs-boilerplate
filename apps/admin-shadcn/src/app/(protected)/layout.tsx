import { Separator } from '@workspace/ui/components/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@workspace/ui/components/sidebar'

import { DynamicBreadcrumb } from '@/app/(protected)/_components/breadcrumb'
import { AppSidebar } from '@/components/app-sidebar'
import { UserProvider } from '@/components/user-provider'
import { getServerUser } from '@/lib/server-user'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser()

  return (
    <UserProvider user={user}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <DynamicBreadcrumb />
            </div>
          </header>
          <main id="main-content" className="flex flex-1 flex-col">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  )
}
