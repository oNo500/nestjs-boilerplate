'use client'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@workspace/ui/components/pagination'

interface TablePaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

function getPageNumbers(page: number, totalPages: number, siblingCount: number): (number | 'ellipsis')[] {
  const totalPageNumbers = siblingCount * 2 + 5 // siblings + current + first + last + 2 ellipsis

  if (totalPages <= totalPageNumbers) {
    return range(1, totalPages)
  }

  const leftSiblingIndex = Math.max(page - siblingCount, 1)
  const rightSiblingIndex = Math.min(page + siblingCount, totalPages)

  const showLeftEllipsis = leftSiblingIndex > 2
  const showRightEllipsis = rightSiblingIndex < totalPages - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = range(1, 3 + siblingCount * 2)
    return [...leftRange, 'ellipsis', totalPages]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = range(totalPages - 2 - siblingCount * 2, totalPages)
    return [1, 'ellipsis', ...rightRange]
  }

  const middleRange = range(leftSiblingIndex, rightSiblingIndex)
  return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages]
}

export function TablePagination({ page, totalPages, onPageChange, siblingCount = 1 }: TablePaginationProps) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(page, totalPages, siblingCount)

  function handleClick(e: React.MouseEvent, targetPage: number) {
    e.preventDefault()
    if (targetPage >= 1 && targetPage <= totalPages) {
      onPageChange(targetPage)
    }
  }

  return (
    <div className="flex justify-end">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => handleClick(e, page - 1)}
              aria-disabled={page <= 1}
              className={page <= 1 ? 'pointer-events-none opacity-50' : undefined}
            />
          </PaginationItem>

          {pages.map((p, i) =>
            p === 'ellipsis'
              ? (
                  // eslint-disable-next-line @eslint-react/no-array-index-key
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => handleClick(e, p)}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ),
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => handleClick(e, page + 1)}
              aria-disabled={page >= totalPages}
              className={page >= totalPages ? 'pointer-events-none opacity-50' : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
