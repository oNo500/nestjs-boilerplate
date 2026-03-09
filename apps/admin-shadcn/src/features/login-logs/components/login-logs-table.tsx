'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip'

import { DataTable } from '@/components/data-table/data-table'
import { LoginStatusBadge } from '@/features/login-logs/components/login-status-badge'

import type { components } from '@/types/openapi'
import type { ColumnDef } from '@tanstack/react-table'

type LoginLogRow = components['schemas']['LoginLogItemDto']

const columns: ColumnDef<LoginLogRow>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Time',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <LoginStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'failReason',
    header: 'Fail Reason',
    cell: ({ row }) => row.original.failReason ?? <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP',
    cell: ({ row }) => row.original.ipAddress ?? <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: 'userAgent',
    header: 'User Agent',
    cell: ({ row }) => {
      const ua = row.original.userAgent
      if (!ua) return <span className="text-muted-foreground">—</span>
      const truncated = ua.length > 60 ? `${ua.slice(0, 60)}…` : ua
      return (
        <Tooltip>
          <TooltipTrigger render={<span className="cursor-default" />}>
            {truncated}
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs break-all">{ua}</p>
          </TooltipContent>
        </Tooltip>
      )
    },
  },
]

interface LoginLogsTableProps {
  data: LoginLogRow[]
  isLoading?: boolean
}

export function LoginLogsTable({ data, isLoading }: LoginLogsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyText="No login logs found."
    />
  )
}
