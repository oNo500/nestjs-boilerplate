'use client'

import { Input } from '@workspace/ui/components/input'
import { useState } from 'react'

import { TablePageHeader } from '@/components/table-page-header'
import { TablePagination } from '@/components/table-pagination'
import { AuditLogsTable } from '@/features/audit-logs/components/audit-logs-table'
import { $api } from '@/lib/api'

const PAGE_SIZE = 20

export function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')

  const { data, isLoading } = $api.useQuery('get', '/api/audit-logs', {
    params: {
      query: {
        page,
        pageSize: PAGE_SIZE,
        ...(action ? { action } : {}),
      },
    },
  })

  const logs = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  function handleActionChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAction(e.target.value)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      <TablePageHeader
        title="Audit Logs"
        description={total > 0 ? `${total} record${total === 1 ? '' : 's'} total` : undefined}
        actions={(
          <Input
            placeholder="Filter by action..."
            value={action}
            onChange={handleActionChange}
            className="w-[200px]"
          />
        )}
        hint="Click a row to expand before/after details."
      />

      <AuditLogsTable data={logs} isLoading={isLoading} />

      <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
