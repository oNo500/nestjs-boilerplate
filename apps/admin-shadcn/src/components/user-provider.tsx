'use client'

import * as React from 'react'

import type { StoredUser } from '@/lib/token'

const UserContext = React.createContext<StoredUser | null>(null)

export function UserProvider({
  user,
  children,
}: {
  user: StoredUser | null
  children: React.ReactNode
}) {
  return <UserContext value={user}>{children}</UserContext>
}

export function useUser(): StoredUser | null {
  return React.use(UserContext)
}
