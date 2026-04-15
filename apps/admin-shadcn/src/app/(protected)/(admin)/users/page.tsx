import { UsersPage } from '@/features/user-management/users-page'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Users',
}

export default function Page() {
  return <UsersPage />
}
