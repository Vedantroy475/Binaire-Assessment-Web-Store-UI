import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { MediaItem } from '@/types'
import { MediaCard } from '@/components/MediaCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

interface ShelfProps {
  title: string
  /** Optional descriptive line shown under the title. */
  subtitle?: string
  items: MediaItem[]
  loading?: boolean
  moreHref?: string
}

/**
 * Shelf - a horizontally-scrollable category row (like Steam's home shelves).
 * Uses native scroll-snap with custom prev/next buttons. Shows skeletons while
 * loading and an empty state when there is nothing to show.
 */
export function Shelf({ title, subtitle, items, loading, moreHref }: ShelfProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section className="space-y-3" aria-labelledby={`shelf-${slug(title)}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2
            id={`shelf-${slug(title)}`}
            className="text-base font-semibold uppercase tracking-wide text-steam-text"
          >
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-xs text-steam-textdim">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {moreHref && (
            <Link
              to={moreHref}
              className="text-xs text-steam-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steam-blue"
            >
              See more
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Scroll ${title} left`}
            onClick={() => scrollBy(-1)}
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Scroll ${title} right`}
            onClick={() => scrollBy(1)}
            className="h-7 w-7"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[190px] w-[326px] shrink-0" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-6 text-sm text-steam-textdim">Nothing here right now.</p>
      ) : (
        <div
          ref={scrollerRef}
          className={cn(
            'flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2',
            'scrollbar-thin',
          )}
        >
          {items.map((item) => (
            <MediaCard key={item.id} item={item} className="w-[280px] shrink-0 snap-start sm:w-[326px]" />
          ))}
        </div>
      )}
    </section>
  )
}

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}
