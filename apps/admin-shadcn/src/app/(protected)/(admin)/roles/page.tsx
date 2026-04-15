import { RolesPage } from '@/features/roles/roles-page'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roles',
}

export default function Page() {
  return <RolesPage />
}
