'use client'

import { DataTable } from '@/components/data-table/data-table'
import { UserActionsMenu } from '@/features/user-management/components/user-actions-menu'
import { UserStatusBadge } from '@/features/user-management/components/user-status-badge'

import type { UserRow } from '@/features/user-management/types'
import type { ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<UserRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => row.original.role ?? '-',
  },
  {
    accessorKey: 'banned',
    header: 'Status',
    cell: ({ row }) => <UserStatusBadge banned={row.original.banned} />,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <UserActionsMenu user={row.original} />,
  },
]

interface UsersTableProps {
  data: UserRow[]
  isLoading?: boolean
}

export function UsersTable({ data, isLoading }: UsersTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyText="No users found."
    />
  )
}
