'use client'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@workspace/ui/components/pagination'
import { useEffect, useState } from 'react'

import { ArticlesTable } from '@/features/articles/components/articles-table'
import { $api } from '@/lib/api'

const PAGE_SIZE = 10

type PageItem = { key: string, value: number | 'ellipsis' }

function toPageItems(arr: (number | 'ellipsis')[]): PageItem[] {
  return arr.map((v, i) => ({
    key: v === 'ellipsis' ? `ellipsis-${i}` : String(v),
    value: v,
  }))
}

function getPageNumbers(current: number, total: number): PageItem[] {
  if (total <= 7) return toPageItems(Array.from({ length: total }, (_, i) => i + 1))
  if (current <= 4) return toPageItems([1, 2, 3, 4, 5, 'ellipsis', total])
  if (current >= total - 3) return toPageItems([1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total])
  return toPageItems([1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total])
}

export function OffsetPaginationPanel() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [q])

  const { data, isLoading } = $api.useQuery('get', '/api/articles/paginated', {
    params: { query: { page, pageSize: PAGE_SIZE, ...(debouncedQ ? { q: debouncedQ } : {}) } },
  })

  const articles = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
        <strong>Offset Pagination</strong>
        {' '}
        — Uses
        {' '}
        <code>page</code>
        {' '}
        +
        {' '}
        <code>pageSize</code>
        . Returns
        {' '}
        <code>total</code>
        {' '}
        count for page navigation.
        Simple but slower on large tables (DB must scan all preceding rows).
      </div>

      <Input
        placeholder="Search articles..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-sm"
      />

      <ArticlesTable data={articles} isLoading={isLoading} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total > 0 ? `${total} articles total` : ''}
          </p>
          <Pagination className="w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-disabled={page <= 1}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {pageNumbers.map(({ key, value }) =>
                value === 'ellipsis'
                  ? (
                      <PaginationItem key={key}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  : (
                      <PaginationItem key={key}>
                        <Button
                          variant={value === page ? 'outline' : 'ghost'}
                          size="icon"
                          onClick={() => setPage(value)}
                          aria-current={value === page ? 'page' : undefined}
                        >
                          {value}
                        </Button>
                      </PaginationItem>
                    ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-disabled={page >= totalPages}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
