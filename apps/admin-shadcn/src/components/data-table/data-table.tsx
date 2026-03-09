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
import React from 'react'

import type { ColumnDef } from '@tanstack/react-table'

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  isLoading?: boolean
  skeletonRows?: number
  emptyText?: string
  // Expandable row support (used by AuditLogs)
  getRowId?: (row: TData) => string
  expandedRowId?: string | null
  onRowClick?: (row: TData) => void
  renderExpandedRow?: (row: TData) => React.ReactNode
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  skeletonRows = 5,
  emptyText = 'No results found.',
  getRowId,
  expandedRowId,
  onRowClick,
  renderExpandedRow,
}: DataTableProps<TData>) {
  'use no memo'

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: skeletonRows }, (_, i) => `sk-${i}`).map((key) => (
          <Skeleton key={key} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  const hasExpandRow = !!(getRowId && renderExpandedRow)

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
            ? table.getRowModel().rows.map((row) => {
                const rowId = hasExpandRow ? getRowId(row.original) : undefined
                const isExpanded = hasExpandRow && expandedRowId === rowId

                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      className={onRowClick ? 'cursor-pointer' : undefined}
                      onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="bg-muted/30">
                          {renderExpandedRow(row.original)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })
            : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    {emptyText}
                  </TableCell>
                </TableRow>
              )}
        </TableBody>
      </Table>
    </div>
  )
}
