'use client'

import { Header } from '@/components/layouts'
import { ThemeToggle } from '@/components/theme-toggle'
import { $api } from '@/lib/fetch-client'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@workspace/ui/components/ui/button'
import Link from 'next/link'
import { NavUser } from './nav-user'
import { Logo } from '@/components/logo'
const Nav = () => {
  const sessionQuery = useQuery({
    ...$api.queryOptions('get', '/api/auth/session'),
  })

  const email = sessionQuery.data?.user?.email
  const isSuccess = sessionQuery.isSuccess

  return (
    <Header className="absolute top-0">
      <Logo />
      <div className="flex flex-1 items-center justify-end">
        <ThemeToggle />
        {isSuccess
          ? (
              <NavUser username={email} />
            )
          : (
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
            )}

      </div>
    </Header>
  )
}

export { Nav }
