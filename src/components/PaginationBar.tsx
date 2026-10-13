import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PaginationState } from '@/types'
import { cn } from '@/utils/cn'

interface PaginationProps {
  state: PaginationState
  pageNumbers: number[]
  onPageChange: (page: number) => void
  className?: string
}

/**
 * PaginationBar - a from-scratch pagination control (no library, no React
 * built-in pagination). Renders first/prev, a windowed set of page numbers,
 * and next/last. Fully keyboard accessible with aria labels and aria-current.
 */
export function PaginationBar({ state, pageNumbers, onPageChange, className }: PaginationProps) {
  const { page, totalPages, hasNext, hasPrevious } = state

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={!hasPrevious}
        aria-label="First page"
      >
        <ChevronLeft className="h-4 w-4" />
        <ChevronLeft className="-ml-2 h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevious}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Ellipsis for skipped pages at the start */}
      {pageNumbers[0] > 1 && <span className="px-1 text-steam-textdim">…</span>}

      {pageNumbers.map((p) => (
        <Button
          key={p}
          variant={p === page ? 'primary' : 'ghost'}
          size="icon"
          onClick={() => onPageChange(p)}
          aria-label={`Page ${p}`}
          aria-current={p === page ? 'page' : undefined}
          className={cn(p === page && 'pointer-events-none')}
        >
          {p}
        </Button>
      ))}

      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <span className="px-1 text-steam-textdim">…</span>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={!hasNext}
        aria-label="Last page"
      >
        <ChevronRight className="h-4 w-4" />
        <ChevronRight className="-ml-2 h-4 w-4" />
      </Button>
    </nav>
  )
}
