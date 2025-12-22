import { appPaths } from '@/config/app-paths'
import { fetchClient } from '@/lib/fetch-client'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@workspace/ui/components/ui/dropdown-menu'
import { UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const NavUser = ({ username}: { username: string | undefined }) => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const logout = async () => {
    try {
      await fetchClient.POST('/api/auth/logout', { body: { refreshToken: '' } }) // Route handler handles refreshToken
    } finally {
      queryClient.clear()
      router.push(appPaths.auth.login.getHref())
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          {username}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { NavUser }
