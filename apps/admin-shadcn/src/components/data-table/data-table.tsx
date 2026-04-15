'use client'

import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
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

  const hasExpandRow = !!(getRowId && renderExpandedRow)
  const rows = table.getRowModel().rows

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
          {isLoading ? (
            Array.from({ length: skeletonRows }, (_, i) => `sk-${i}`).map((key) => (
              <TableRow key={key}>
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length > 0 ? (
            rows.map((row) => {
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
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
