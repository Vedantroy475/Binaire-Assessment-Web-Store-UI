import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { WifiOff, Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { tmdbApi } from '@/api/TmdbApiClient'
import { StoreMedia } from '@/models/StoreMedia'
import { seededRandom, tmdbImage, formatReleaseDate, truncate } from '@/utils/format'
import { LazyImage } from '@/components/ui/LazyImage'
import { PriceTag } from '@/components/PriceTag'
import { Rating } from '@/components/Rating'
import { MediaCard } from '@/components/MediaCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import type { MediaScreenshot } from '@/types'

/**
 * DetailPage - the store item detail page (two-column layout like Steam):
 *  - left: header image, description, reviews, screenshots, tags
 *  - right: capsule, price/purchase box, metadata, developer / release date
 */

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const movieId = Number(id)
  const { isOnline } = useNetworkStatus()
  const [wishlisted, setWishlisted] = useState(false)

  const { data, loading, error } = useAsyncData(async () => {
    const details = await tmdbApi.movieDetails(movieId)
    const [images, similar] = await Promise.all([
      tmdbApi.movieImages(movieId).catch(() => null),
      tmdbApi.similar(movieId).catch(() => null),
    ])
    return { details, images, similar }
  }, [movieId])

  const item = useMemo(() => (data ? StoreMedia.fromDetails(data.details).data : null), [data])

  const screenshots = useMemo<MediaScreenshot[]>(() => {
    if (!data?.images) return []
    return data.images.backdrops.slice(0, 6).map((img, i) => ({
      id: i,
      src: tmdbImage(img.file_path, 'w780') ?? '',
      full: tmdbImage(img.file_path, 'w1280') ?? '',
      width: img.width,
      height: img.height,
    }))
  }, [data])

  const similarItems = useMemo(
    () => (data?.similar?.results ?? []).slice(0, 8).map((m) => StoreMedia.fromSummary(m).data),
    [data],
  )

  const reviewSummary = useMemo(() => buildReviews(movieId), [movieId])

  if (loading) return <DetailSkeleton />
  if (error || !item) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div role="alert" className="rounded border border-destructive/40 bg-destructive/10 px-4 py-3 text-steam-text">
          {error?.message ?? 'Could not load this title.'}
        </div>
        <Link to="/" className="mt-4 inline-block text-steam-blue hover:underline">
          ← Back to store
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {!isOnline && (
        <div role="status" className="mb-4 flex items-center gap-2 rounded border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-steam-text">
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          You are offline — showing cached details.
        </div>
      )}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-steam-textdim">
        <Link to="/" className="hover:text-steam-blue">
          All Titles
        </Link>
        <span className="mx-1">›</span>
        <span className="text-steam-text">{item.title}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold text-steam-text sm:text-3xl">{item.title}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* ---------------- Left column ---------------- */}
        <div className="space-y-8">
          <div className="aspect-[460/215] w-full overflow-hidden rounded bg-steam-card">
            <LazyImage
              src={tmdbImage(item.headerImage, 'w1280')}
              alt={`${item.title} main image`}
              wrapperClassName="h-full w-full"
            />
          </div>

          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="mb-2 text-lg font-semibold text-steam-text">
              About this title
            </h2>
            <p className="text-sm leading-relaxed text-steam-text">{item.description}</p>
          </section>

          <section aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="mb-3 text-lg font-semibold text-steam-text">
              Reviews
            </h2>
            <div className="panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-steam-text">{reviewSummary}</p>
                <p className="text-xs text-steam-textdim">
                  {item.reviewCount.toLocaleString()} user reviews for this title.
                </p>
              </div>
              <Rating value={item.rating} count={item.reviewCount} />
            </div>
          </section>

          {screenshots.length > 0 && (
            <section aria-labelledby="screenshots-heading">
              <h2 id="screenshots-heading" className="mb-3 text-lg font-semibold text-steam-text">
                Screenshots
              </h2>
              <ScreenshotGallery screenshots={screenshots} title={item.title} />
            </section>
          )}

          <section aria-labelledby="tags-heading">
            <h2 id="tags-heading" className="mb-3 text-lg font-semibold text-steam-text">
              Popular tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {(item.tags.length > 0 ? item.tags : item.genres).map((tag) => (
                <Badge key={tag} variant="secondary" className="px-2 py-1 text-xs text-steam-textdim">
                  {tag}
                </Badge>
              ))}
            </div>
          </section>
        </div>

        {/* ---------------- Right column ---------------- */}
        <aside className="space-y-4">
          <div className="aspect-[460/215] w-full overflow-hidden rounded bg-steam-card">
            <LazyImage
              src={tmdbImage(item.capsuleImage, 'w342')}
              alt={`${item.title} capsule`}
              wrapperClassName="h-full w-full"
            />
          </div>

          {/* Purchase box */}
          <div className="panel space-y-3 p-4">
            <p className="text-xs text-steam-textdim">Buy {item.title}</p>
            <PriceTag price={item.price} discountPercent={item.discountPercent} size="lg" />
            <div className="flex gap-2">
              <Button variant="primary" className="flex-1">
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                Add to cart
              </Button>
              <Button
                variant={wishlisted ? 'outline' : 'ghost'}
                size="icon"
                aria-pressed={wishlisted}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                onClick={() => setWishlisted((v) => !v)}
              >
                <Heart className={cn('h-4 w-4', wishlisted && 'fill-destructive text-destructive')} aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Meta */}
          <div className="panel space-y-2 p-4 text-xs text-steam-textdim">
            <MetaRow label="Developer" value={item.developer} />
            <MetaRow label="Publisher" value={item.publisher} />
            <MetaRow label="Release date" value={formatReleaseDate(item.releaseDate)} />
            <MetaRow label="Rating" value={`${item.rating.toFixed(1)} / 10`} />
            <div className="flex items-center justify-between">
              <span>Platforms</span>
              <span className="capitalize text-steam-text">{item.platforms.join(', ')}</span>
            </div>
          </div>

          {item.shortDescription && (
            <div className="panel p-4 text-xs italic text-steam-textdim">
              “{truncate(item.shortDescription, 140)}”
            </div>
          )}
        </aside>
      </div>

      {/* Similar titles */}
      {similarItems.length > 0 && (
        <section className="mt-12" aria-labelledby="similar-heading">
          <h2 id="similar-heading" className="mb-4 text-lg font-semibold text-steam-text">
            More like this
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {similarItems.map((s) => (
              <MediaCard key={s.id} item={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}


/* ------------------------------ helpers ------------------------------ */

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="text-steam-text">{value}</span>
    </div>
  )
}

function ScreenshotGallery({
  screenshots,
  title,
}: {
  screenshots: MediaScreenshot[]
  title: string
}) {
  const [active, setActive] = useState(0)
  const shot = screenshots[active]

  const go = (dir: 1 | -1) => setActive((i) => (i + dir + screenshots.length) % screenshots.length)

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded bg-steam-card">
        <LazyImage src={shot.full} alt={`${title} screenshot ${active + 1}`} wrapperClassName="h-full w-full" />
        {screenshots.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous screenshot"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next screenshot"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {screenshots.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show screenshot ${i + 1}`}
            aria-current={i === active}
            className={cn(
              'h-14 w-24 shrink-0 overflow-hidden rounded border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steam-blue',
              i === active ? 'border-steam-blue' : 'border-transparent hover:border-white/40',
            )}
          >
            <LazyImage src={s.src} alt="" wrapperClassName="h-full w-full" />
          </button>
        ))}
      </div>
    </div>
  )
}

function buildReviews(movieId: number): string {
  const r = seededRandom(movieId)
  const positives = ['Very Positive', 'Positive', 'Mostly Positive', 'Overwhelmingly Positive']
  const negatives = ['Mixed', 'Mostly Negative', 'Negative']
  const pool = r > 0.3 ? positives : negatives
  return pool[Math.floor(seededRandom(movieId + 5) * pool.length)]
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Skeleton className="h-[260px] w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[140px] w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
}

