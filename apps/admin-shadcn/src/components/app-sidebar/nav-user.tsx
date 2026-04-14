'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Button } from '@workspace/ui/components/button'
import { MoonIcon, SunIcon, SunMoonIcon } from 'lucide-react'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@workspace/ui/components/sidebar'
import { ChevronsUpDownIcon, LogOutIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'

import { appPaths } from '@/config/app-paths'
import { removeToken, removeRefreshToken, removeUser } from '@/lib/token'

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const handleLogout = () => {
    removeToken()
    removeRefreshToken()
    removeUser()
    router.push(appPaths.auth.login.getHref())
  }

  const avatarFallback = user.email ? (user.email[0] ?? 'U').toUpperCase() : 'U'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />}
          >
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm text-muted-foreground">Theme</span>
              <div className="flex gap-1">
                <Button
                  variant={theme === 'light' ? 'default' : 'ghost'}
                  size="icon"
                  className="size-7"
                  onClick={() => setTheme('light')}
                >
                  <SunIcon className="size-3.5" />
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'ghost'}
                  size="icon"
                  className="size-7"
                  onClick={() => setTheme('system')}
                >
                  <SunMoonIcon className="size-3.5" />
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'ghost'}
                  size="icon"
                  className="size-7"
                  onClick={() => setTheme('dark')}
                >
                  <MoonIcon className="size-3.5" />
                </Button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
