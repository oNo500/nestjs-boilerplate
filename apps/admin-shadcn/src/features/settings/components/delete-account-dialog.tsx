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
  AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { useState } from 'react'
import { toast } from 'sonner'

export function DeleteAccountDialog() {
  const [confirmText, setConfirmText] = useState('')
  const [open, setOpen] = useState(false)

  const canDelete = confirmText === 'DELETE'

  function handleDelete() {
    if (!canDelete) return
    toast.success('Account deletion initiated')
    setOpen(false)
    setConfirmText('')
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/5" />
        }
      >
        Delete Account
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent and cannot be undone. All your data will be permanently deleted.
            Type
            {' '}
            <strong className="text-foreground">DELETE</strong>
            {' '}
            to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Input
          placeholder="Type DELETE to confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="mt-2"
        />

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel onClick={() => setConfirmText('')}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: 'destructive' })}
            onClick={handleDelete}
            disabled={!canDelete}
          >
            Delete Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
