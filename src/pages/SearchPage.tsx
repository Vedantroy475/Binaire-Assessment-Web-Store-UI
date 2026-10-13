import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { WifiOff } from 'lucide-react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { tmdbApi } from '@/api/TmdbApiClient'
import { StoreMedia } from '@/models/StoreMedia'
import { SearchEngine } from '@/search/SearchEngine'
import { MediaCard } from '@/components/MediaCard'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * SearchPage - store search results. Queries TMDB's /search endpoint and then
 * narrows/orders the results client-side with the {@link SearchEngine}.
 */
export function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get('q') ?? ''
  const { isOnline } = useNetworkStatus()
  const [refine, setRefine] = useState('')

  const { data, loading, error } = useAsyncData(() => tmdbApi.search(query, 1), [query])

  const results = useMemo(() => {
    const items = (data?.results ?? []).map((m) => StoreMedia.fromSummary(m).data)
    if (!refine.trim()) return items
    const engine = new SearchEngine()
    engine.setQuery(refine)
    return engine.search(items)
  }, [data, refine])

  useEffect(() => {
    document.title = query ? `“${query}” - WebStore` : 'Search - WebStore'
  }, [query])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold text-steam-text">Search results</h1>
      <p className="mb-4 text-sm text-steam-textdim">
        {query ? (
          <>
            Showing results for <span className="text-steam-text">“{query}”</span> · {results.length} matches
          </>
        ) : (
          'Enter a search term using the search box in the header.'
        )}
      </p>

      {!isOnline && (
        <div role="status" className="mb-4 flex items-center gap-2 rounded border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-steam-text">
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          You are offline — only cached searches are available.
        </div>
      )}

      {query && (
        <div className="mb-6 max-w-md">
          <label htmlFor="refine" className="mb-1 block text-xs uppercase tracking-wide text-steam-textdim">
            Narrow results
          </label>
          <input
            id="refine"
            type="search"
            value={refine}
            onChange={(e) => setRefine(e.target.value)}
            placeholder="Filter within these results"
            className="h-9 w-full rounded-sm border border-steam-blue/30 bg-steam-header/60 px-3 text-sm text-steam-text placeholder:text-steam-textdim focus-visible:outline-none focus-visible:border-steam-blue"
          />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[190px] w-full" />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="rounded border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-steam-text">
          {error.message}
        </div>
      ) : results.length === 0 && query ? (
        <p className="py-10 text-sm text-steam-textdim">
          No titles matched your search. Try a different term.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <p className="mt-8 text-sm text-steam-textdim">
        <Link to="/" className="text-steam-blue hover:underline hover:text-white hover:font-bold">
          ← Back to the store
        </Link>
      </p>
    </div>
  )
}
