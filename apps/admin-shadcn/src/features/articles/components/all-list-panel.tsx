'use client'

import { ArticlesTable } from '@/features/articles/components/articles-table'
import { $api } from '@/lib/api'

export function AllListPanel() {
  const { data, isLoading } = $api.useQuery('get', '/api/articles/all')

  const articles = data?.data ?? []

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
        <strong>No Pagination</strong>
        {' '}
        — Fetches all records in a single request.
        Only suitable for small, relatively static datasets (e.g. config lists, dropdown options).
        Avoid when the dataset may grow unbounded.
      </div>

      <ArticlesTable data={articles} isLoading={isLoading} />

      <div className="text-sm text-muted-foreground">
        {!isLoading && `${articles.length} articles loaded`}
      </div>
    </div>
  )
}
