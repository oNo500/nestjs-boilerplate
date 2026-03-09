'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'

import { ArticleActionsMenu } from '@/features/articles/components/article-actions-menu'
import { ArticleStatusBadge } from '@/features/articles/components/article-status-badge'

import type { components } from '@/types/openapi'
import type { ColumnDef } from '@tanstack/react-table'

type ArticleRow = components['schemas']['ArticleResponseDto']

const columns: ColumnDef<ArticleRow>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.title}</span>
    ),
  },
  {
    accessorKey: 'author',
    header: 'Author',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <span className="capitalize">{row.original.category}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <ArticleStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) =>
      row.original.tags.length > 0
        ? row.original.tags.join(', ')
        : <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: 'viewCount',
    header: 'Views',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <ArticleActionsMenu article={row.original} />,
  },
]

interface ArticlesTableProps {
  data: ArticleRow[]
  isLoading?: boolean
}

export function ArticlesTable({ data, isLoading }: ArticlesTableProps) {
  'use no memo'

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }, (_, i) => `sk-${i}`).map((key) => (
          <Skeleton key={key} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0
            ? table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No articles found.
                  </TableCell>
                </TableRow>
              )}
        </TableBody>
      </Table>
    </div>
  )
}
