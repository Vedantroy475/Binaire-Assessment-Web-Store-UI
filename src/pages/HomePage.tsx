import { useEffect, useMemo, useState } from 'react'
import { WifiOff } from 'lucide-react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { tmdbApi } from '@/api/TmdbApiClient'
import { StoreMedia } from '@/models/StoreMedia'
import { Shelf } from '@/components/Shelf'
import { FeaturedCarousel } from '@/components/FeaturedCarousel'
import { Skeleton } from '@/components/ui/skeleton'
import type { MediaItem, TmdbMovieListResponse } from '@/types'

/**
 * HomePage - the store front.
 *
 * Featured/Spotlight carousel at the top, then horizontally scrolling shelves
 * for each category. Data comes from TMDB (trending / popular / top-rated /
 * upcoming) and is normalised by {@link StoreMedia}. Because every shelf is an
 * independent request, shelves render progressively as their data arrives.
 */
export function HomePage() {
  const { isOnline } = useNetworkStatus()
  const [featured, setFeatured] = useState<MediaItem[]>([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)

  const { data: trending } = useAsyncData<TmdbMovieListResponse>(() => tmdbApi.trending(), ['trending'])
  const { data: popular } = useAsyncData<TmdbMovieListResponse>(() => tmdbApi.popular(), ['popular'])
  const { data: topRated } = useAsyncData<TmdbMovieListResponse>(() => tmdbApi.topRated(), ['top'])
  const { data: upcoming } = useAsyncData<TmdbMovieListResponse>(() => tmdbApi.upcoming(), ['upcoming'])

  // Featured = the top trending titles.
  useEffect(() => {
    if (trending) {
      setFeatured(trending.results.slice(0, 5).map((m) => StoreMedia.fromSummary(m).data))
      setLoadingFeatured(false)
    }
  }, [trending])

  const trendingItems = useMemo(
    () => (trending?.results ?? []).map((m) => StoreMedia.fromSummary(m).data),
    [trending],
  )
  const popularItems = useMemo(
    () => (popular?.results ?? []).map((m) => StoreMedia.fromSummary(m).data),
    [popular],
  )
  const topRatedItems = useMemo(
    () => (topRated?.results ?? []).map((m) => StoreMedia.fromSummary(m).data),
    [topRated],
  )
  const upcomingItems = useMemo(
    () => (upcoming?.results ?? []).map((m) => StoreMedia.fromSummary(m).data),
    [upcoming],
  )

  return (
    <div className="space-y-10 pb-12">
      {!isOnline && (
        <div
          role="status"
          className="flex items-center gap-2 rounded border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-steam-text"
        >
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          You are offline — showing cached content.
        </div>
      )}

      {loadingFeatured ? (
        <Skeleton className="h-[320px] w-full sm:h-[420px]" />
      ) : featured.length > 0 ? (
        <FeaturedCarousel items={featured} />
      ) : null}

      <div className="mx-auto max-w-7xl space-y-10 px-4">
        <Shelf
          title="Featured &amp; Recommended"
          subtitle="Trending this week"
          items={trendingItems}
          loading={!trending}
          moreHref="/new-releases"
        />
        <Shelf
          title="Top Sellers"
          subtitle="Most popular right now"
          items={popularItems}
          loading={!popular}
          moreHref="/new-releases"
        />
        <Shelf
          title="Best Reviewed"
          subtitle="Highest rated titles"
          items={topRatedItems}
          loading={!topRated}
          moreHref="/new-releases"
        />
        <Shelf
          title="Upcoming"
          subtitle="Coming soon"
          items={upcomingItems}
          loading={!upcoming}
          moreHref="/new-releases"
        />
      </div>
    </div>
  )
}
