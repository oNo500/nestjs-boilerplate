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
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { MoreHorizontalIcon } from 'lucide-react'
import { useState } from 'react'

import { ArticleFormSheet } from '@/features/articles/components/article-form-sheet'
import { useDeleteArticle, usePublishArticle, useArchiveArticle } from '@/features/articles/hooks/use-article-mutations'

import type { components } from '@/types/openapi'

type ArticleRow = components['schemas']['ArticleResponseDto']

interface ArticleActionsMenuProps {
  article: ArticleRow
}

export function ArticleActionsMenu({ article }: ArticleActionsMenuProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteMutation = useDeleteArticle()
  const publishMutation = usePublishArticle()
  const archiveMutation = useArchiveArticle()

  function handleDelete() {
    deleteMutation.mutate(
      { params: { path: { id: article.id } } },
      { onSuccess: () => setDeleteOpen(false) },
    )
  }

  function handlePublish() {
    publishMutation.mutate({ params: { path: { id: article.id } } })
  }

  function handleArchive() {
    archiveMutation.mutate({ params: { path: { id: article.id } } })
  }

  const canEdit = article.status === 'draft'
  const canPublish = article.status === 'draft'
  const canArchive = article.status === 'published'

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
          {canEdit && (
            <ArticleFormSheet
              article={article}
              trigger={(
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Edit
                </DropdownMenuItem>
              )}
            />
          )}

          {canPublish && (
            <DropdownMenuItem
              onClick={handlePublish}
              disabled={publishMutation.isPending}
            >
              Publish
            </DropdownMenuItem>
          )}

          {canArchive && (
            <DropdownMenuItem
              onClick={handleArchive}
              disabled={archiveMutation.isPending}
            >
              Archive
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete article?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete
              {' '}
              <strong>{article.title}</strong>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
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
