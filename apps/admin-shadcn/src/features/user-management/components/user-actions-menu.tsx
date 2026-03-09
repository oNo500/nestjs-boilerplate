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
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { MoreHorizontalIcon } from 'lucide-react'
import { useState } from 'react'

import { useAssignRole } from '@/features/user-management/hooks/use-assign-role'
import { useBanUser } from '@/features/user-management/hooks/use-ban-user'
import { useDeleteUser } from '@/features/user-management/hooks/use-delete-user'

import type { UserRow } from '@/features/user-management/types'

const ROLES = ['ADMIN', 'USER', 'EDITOR', 'MODERATOR'] as const

interface UserActionsMenuProps {
  user: UserRow
}

export function UserActionsMenu({ user }: UserActionsMenuProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const banMutation = useBanUser()
  const deleteMutation = useDeleteUser()
  const roleMutation = useAssignRole()

  function handleToggleBan() {
    banMutation.mutate({
      params: { path: { id: user.id } },
      body: { banned: !user.banned },
    })
  }

  function handleDelete() {
    deleteMutation.mutate(
      { params: { path: { id: user.id } } },
      { onSuccess: () => setDeleteOpen(false) },
    )
  }

  function handleRoleChange(role: typeof ROLES[number]) {
    roleMutation.mutate({
      params: { path: { id: user.id } },
      body: { role },
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={(
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        )}
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleToggleBan}
            disabled={banMutation.isPending}
            className={user.banned ? 'text-green-600' : 'text-destructive'}
          >
            {user.banned ? 'Unban user' : 'Ban user'}
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Change role</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {ROLES.map((role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  disabled={roleMutation.isPending}
                >
                  {role}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Delete user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete
              {' '}
              <strong>{user.email}</strong>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
