import { Link } from 'react-router-dom'
import { Film, Clock, Star, Flame, CalendarClock } from 'lucide-react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { tmdbApi } from '@/api/TmdbApiClient'
import { StoreMedia } from '@/models/StoreMedia'
import { MediaCard } from '@/components/MediaCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { MediaItem } from '@/types'

/**
 * CategoriesPage - browse the store by category (top sellers, new releases,
 * upcoming, popular). Each category links into NewReleases with a preset, so
 * no duplicate logic is needed.
 */
export function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-bold text-steam-text">Categories</h1>
      <p className="mb-6 text-sm text-steam-textdim">Browse titles by category.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CategoryCard icon={<Flame />} title="Top Sellers" desc="What everyone is buying right now" href="/new-releases?sort=popularity_desc" />
        <CategoryCard icon={<Clock />} title="New Releases" desc="Just released titles" href="/new-releases" />
        <CategoryCard icon={<CalendarClock />} title="Upcoming" desc="Releasing soon" href="/new-releases?sort=release_asc" />
        <CategoryCard icon={<Star />} title="Top Rated" desc="Highest reviewed titles" href="/new-releases?sort=rating_desc" />
        <CategoryCard icon={<Film />} title="All Titles" desc="The full catalogue" href="/new-releases" />
      </div>

      <PreviewSection
        title="Top rated right now"
        fetcher={() => tmdbApi.topRated()}
      />
    </div>
  )
}

function CategoryCard({
  icon,
  title,
  desc,
  href,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  href: string
}) {
  return (
    <Link
      to={href}
      className="panel flex items-center gap-4 p-5 transition-colors hover:bg-steam-cardhover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steam-blue"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded bg-steam-blue/10 text-steam-blue [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </span>
      <span>
        <span className="block font-semibold text-steam-text">{title}</span>
        <span className="block text-xs text-steam-textdim">{desc}</span>
      </span>
    </Link>
  )
}

function PreviewSection({
  title,
  fetcher,
}: {
  title: string
  fetcher: () => Promise<{ results: import('@/types').TmdbMovieSummary[] }>
}) {
  const { data, loading } = useAsyncData<{ results: import('@/types').TmdbMovieSummary[] }>(
    fetcher,
    [title],
  )
  const items: MediaItem[] = (data?.results ?? []).slice(0, 4).map((m) => StoreMedia.fromSummary(m).data)

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-semibold text-steam-text">{title}</h2>
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[190px] w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}
