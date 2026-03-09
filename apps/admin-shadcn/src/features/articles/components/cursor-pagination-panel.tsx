'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@workspace/ui/components/pagination'
import { useState } from 'react'

import { ArticlesTable } from '@/features/articles/components/articles-table'
import { $api } from '@/lib/api'

const PAGE_SIZE = 10

export function CursorPaginationPanel() {
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null])
  const currentCursor = cursorStack.at(-1) ?? null

  const { data, isLoading } = $api.useQuery('get', '/api/articles/cursor', {
    params: {
      query: {
        pageSize: PAGE_SIZE,
        ...(currentCursor ? { cursor: currentCursor } : {}),
      },
    },
  })

  const articles = data?.data ?? []
  const nextCursor = data?.nextCursor ? String(data.nextCursor) : null
  const hasMore = data?.hasMore ?? false
  const page = cursorStack.length

  function goNext() {
    if (nextCursor) setCursorStack((s) => [...s, nextCursor])
  }

  function goPrev() {
    setCursorStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
        <strong>Cursor Pagination</strong>
        {' '}
        — Uses an opaque
        {' '}
        <code>cursor</code>
        {' '}
        token (Base64).
        No total count. Consistent performance on large tables — DB seeks directly to the cursor position.
        Ideal for infinite scroll or real-time feeds.
      </div>

      <ArticlesTable data={articles} isLoading={isLoading} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page
          {' '}
          {page}
          {currentCursor && (
            <span className="ml-2 font-mono text-xs" title={currentCursor}>
              cursor:
              {' '}
              {currentCursor.slice(0, 16)}
              …
            </span>
          )}
        </p>
        <Pagination className="w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={goPrev}
                aria-disabled={page <= 1}
                className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={goNext}
                aria-disabled={!hasMore}
                className={hasMore ? '' : 'pointer-events-none opacity-50'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
