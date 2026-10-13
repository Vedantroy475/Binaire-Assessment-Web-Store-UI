import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { WifiOff, SearchX, Loader2 } from 'lucide-react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useIntersection } from '@/hooks/useIntersection'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { tmdbApi } from '@/api/TmdbApiClient'
import { StoreMedia } from '@/models/StoreMedia'
import { FilterEngine, defaultFilterState, activeFilterCount } from '@/filters/FilterEngine'
import { getStrategy, sortOptions } from '@/sorting/strategies'
import { Pagination } from '@/models/Pagination'
import type { FilterState, MediaItem, SortKey } from '@/types'
import { FilterSidebar } from '@/components/FilterSidebar'
import { SortingDropdown } from '@/components/SortingDropdown'
import { MediaCard } from '@/components/MediaCard'
import { PaginationBar } from '@/components/PaginationBar'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * NewReleasesPage - the Explore/New Releases browse page.
 *
 * Combines every piece of the from-scratch architecture:
 *  - Filtering via {@link FilterEngine}
 *  - Polymorphic sorting via the strategy classes
 *  - Pagination via the {@link Pagination} class + {@link PaginationBar}
 *  - Lazy loading via the native IntersectionObserver sentinel
 *  - Clear offline / empty / loading states
 */

const PAGE_SIZE = 20

const FALLBACK_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama',
  'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance',
  'Science Fiction', 'Thriller', 'War', 'Western',
]

export function NewReleasesPage() {
  const { isOnline } = useNetworkStatus()
  const [sortKey, setSortKey] = useState<SortKey>('release_desc')
  const [filters, setFilters] = useState<FilterState>(defaultFilterState())

  // Load several pages of "new releases" so filtering + sorting have data to work with.
  const { data, loading, error } = useAsyncData(async () => {
    const [p1, p2] = await Promise.all([tmdbApi.discover(1), tmdbApi.discover(2)])
    return [...p1.results, ...p2.results]
  }, [])

  const allItems = useMemo<MediaItem[]>(
    () => (data ?? []).map((m) => StoreMedia.fromSummary(m).data),
    [data],
  )

  // Genres available for filtering.
  const genres = useMemo(() => {
    const set = new Set<string>()
    allItems.forEach((i) => i.genres.forEach((g) => set.add(g)))
    return set.size > 0 ? Array.from(set).sort() : FALLBACK_GENRES
  }, [allItems])

  // Apply filters + sorting using the OOP engines.
  const pagination = useMemo(() => {
    const engine = new FilterEngine(filters)
    const filtered = engine.apply(allItems)
    const sorted = getStrategy(sortKey)
    const sortedItems = [...filtered].sort((a, b) => sorted.compare(a, b))
    return new Pagination(sortedItems, PAGE_SIZE)
  }, [allItems, filters, sortKey])

  const [, setTick] = useState(0)
  const rerender = () => setTick((n) => n + 1)

  const pageItems = pagination.currentPageItems()
  const pageNumbers = pagination.pageNumbers(2)
  const filterCount = activeFilterCount(filters)

  // ---- Lazy loading sentinel (native IntersectionObserver) ----
  const sentinelRef = useRef<HTMLDivElement>(null)
  const { ref: attachSentinel } = useIntersection<HTMLDivElement>({ once: true, rootMargin: '300px' })

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    return attachSentinel(node)
  }, [attachSentinel, pagination.page])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-steam-text">New Releases</h1>
          <p className="text-sm text-steam-textdim">
            {pagination.totalItems} titles{filterCount > 0 && ` (${filterCount} filters applied)`}
          </p>
        </div>
        <SortingDropdown options={sortOptions()} value={sortKey} onChange={setSortKey} />
      </div>

      {!isOnline && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-steam-text"
        >
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          You are offline â€” showing cached results. Some filters may be limited.
        </div>
      )}

      <div className="flex gap-6">
        <FilterSidebar
          state={filters}
          genres={genres}
          onChange={setFilters}
          onReset={() => {
            setFilters(defaultFilterState())
            pagination.goTo(1)
            rerender()
          }}
        />

        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-[190px] w-full" />
              ))}
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-steam-text"
            >
              {error.message}
            </div>
          ) : pageItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <SearchX className="h-10 w-10 text-steam-textdim" aria-hidden="true" />
              <p className="text-steam-text">No titles match your filters.</p>
              <button
                type="button"
                onClick={() => setFilters(defaultFilterState())}
                className="text-sm text-steam-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steam-blue"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {pageItems.map((item) => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>

              {/* Lazy-load sentinel */}
              <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />

              {/* From-scratch pagination */}
              <div className="mt-8 flex flex-col items-center gap-3">
                <PaginationBar
                  state={pagination.state}
                  pageNumbers={pageNumbers}
                  onPageChange={(p) => {
                    pagination.goTo(p)
                    rerender()
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />
                {pagination.state.hasNext && (
                  <button
                    type="button"
                    onClick={() => {
                      pagination.next()
                      rerender()
                    }}
                    className="flex items-center gap-2 rounded bg-steam-card px-4 py-2 text-sm font-semibold text-steam-blue hover:bg-steam-cardhover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steam-blue"
                  >
                    <Loader2 className="h-4 w-4" aria-hidden="true" />
                    Load more
                  </button>
                )}
              </div>
            </>
          )}

          <p className="mt-6 text-center text-xs text-steam-textdim">
            Browse titles from the{' '}
            <Link
              to="/"
              className="text-steam-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steam-blue"
            >
              home page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

