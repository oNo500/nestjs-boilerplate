'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { useState } from 'react'

import { DataTable } from '@/components/data-table/data-table'
import { AuditActionBadge } from '@/features/audit-logs/components/audit-action-badge'
import { AuditDetailView } from '@/features/audit-logs/components/audit-detail-view'

import type { components } from '@/types/openapi'
import type { ColumnDef } from '@tanstack/react-table'

type AuditLogRow = components['schemas']['AuditLogResponseDto']

const columns: ColumnDef<AuditLogRow>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Time',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    accessorKey: 'actorEmail',
    header: 'Actor',
    cell: ({ row }) => row.original.actorEmail ?? <span className="text-muted-foreground">system</span>,
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => <AuditActionBadge action={row.original.action} />,
  },
  {
    accessorKey: 'resourceType',
    header: 'Resource Type',
    cell: ({ row }) => row.original.resourceType ?? <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: 'resourceId',
    header: 'Resource ID',
    cell: ({ row }) => {
      const id = row.original.resourceId
      if (!id) return <span className="text-muted-foreground">—</span>
      const truncated = id.length > 12 ? `${id.slice(0, 12)}…` : id
      return (
        <Tooltip>
          <TooltipTrigger render={<span className="cursor-default font-mono text-xs" />}>
            {truncated}
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-mono text-xs">{id}</p>
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP',
    cell: ({ row }) => row.original.ipAddress ?? <span className="text-muted-foreground">—</span>,
  },
]

interface AuditLogsTableProps {
  data: AuditLogRow[]
  isLoading?: boolean
}

export function AuditLogsTable({ data, isLoading }: AuditLogsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function handleRowClick(row: AuditLogRow) {
    setExpandedId(expandedId === row.id ? null : row.id)
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyText="No audit logs found."
      getRowId={(row) => row.id}
      expandedRowId={expandedId}
      onRowClick={handleRowClick}
      renderExpandedRow={(row) => (
        <AuditDetailView detail={row.detail as Record<string, unknown>} />
      )}
    />
  )
}
