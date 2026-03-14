'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { useState } from 'react'

import { DataTable } from '@/components/data-table/data-table'
import { useAssignRole } from '@/features/user-management/hooks/use-assign-role'

import type { UserRow } from '@/features/user-management/types'
import type { ColumnDef } from '@tanstack/react-table'

const ROLES = ['ADMIN', 'USER'] as const

interface PendingChange {
  userId: string
  role: string
  userEmail: string
}

function RoleCell({ user, onPending }: { user: UserRow, onPending: (change: PendingChange) => void }) {
  const currentRole = user.role?.toUpperCase() ?? 'USER'
  const [selected, setSelected] = useState(currentRole)

  const handleChange = (value: string | null) => {
    if (!value) return
    setSelected(value)
    if (value !== currentRole) {
      onPending({ userId: user.id, role: value, userEmail: user.email })
    }
  }

  return (
    <Select value={selected} onValueChange={handleChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            {role === 'ADMIN' ? 'Administrator' : 'User'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

interface RolesTableProps {
  data: UserRow[]
  isLoading?: boolean
}

export function RolesTable({ data, isLoading }: RolesTableProps) {
  const [pending, setPending] = useState<PendingChange | null>(null)
  const assignRole = useAssignRole()

  function handleConfirm() {
    if (!pending) return
    assignRole.mutate(
      { params: { path: { id: pending.userId } }, body: { role: pending.role as never } },
      { onSettled: () => setPending(null) },
    )
  }

  function handleCancel() {
    setPending(null)
  }

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: 'name',
      header: 'Username',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Current Role',
      cell: ({ row }) => (
        <RoleCell
          user={row.original}
          onPending={setPending}
        />
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyText="No users found."
      />

      <AlertDialog open={!!pending} onOpenChange={(open) => { if (!open) handleCancel() }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              Change role of
              {' '}
              <strong>{pending?.userEmail}</strong>
              {' '}
              to
              {' '}
              <strong>{pending?.role === 'ADMIN' ? 'Administrator' : 'User'}</strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={assignRole.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={assignRole.isPending}
            >
              {assignRole.isPending ? 'Saving...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
