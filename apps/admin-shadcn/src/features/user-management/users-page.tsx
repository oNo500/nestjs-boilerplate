'use client'

import { useState } from 'react'

import { TablePageHeader } from '@/components/table-page-header'
import { TablePagination } from '@/components/table-pagination'
import { CreateUserDialog } from '@/features/user-management/components/create-user-dialog'
import { UsersTable } from '@/features/user-management/components/users-table'
import { $api } from '@/lib/api'

const PAGE_SIZE = 20

export function UsersPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = $api.useQuery('get', '/api/users', {
    params: {
      query: { page, pageSize: PAGE_SIZE },
    },
  })

  const users = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      <TablePageHeader
        title="Users"
        description={total > 0 ? `${total} user${total === 1 ? '' : 's'} total` : undefined}
        actions={<CreateUserDialog />}
      />

      <UsersTable data={users} isLoading={isLoading} />

      <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
