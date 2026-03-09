'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { useState } from 'react'

import { TablePageHeader } from '@/components/table-page-header'
import { TablePagination } from '@/components/table-pagination'
import { LoginLogsTable } from '@/features/login-logs/components/login-logs-table'
import { $api } from '@/lib/api'

const PAGE_SIZE = 20

type StatusFilter = 'all' | 'success' | 'failed'

export function LoginLogsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<StatusFilter>('all')

  const { data, isLoading } = $api.useQuery('get', '/api/auth/login-logs', {
    params: {
      query: {
        page,
        pageSize: PAGE_SIZE,
        ...(status === 'all' ? {} : { status }),
      },
    },
  })

  const logs = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  function handleStatusChange(val: StatusFilter | null) {
    setStatus(val ?? 'all')
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      <TablePageHeader
        title="Login Logs"
        description={total > 0 ? `${total} record${total === 1 ? '' : 's'} total` : undefined}
        actions={(
          <Select value={status} onValueChange={(val) => handleStatusChange(val as StatusFilter | null)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        )}
      />

      <LoginLogsTable data={logs} isLoading={isLoading} />

      <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
