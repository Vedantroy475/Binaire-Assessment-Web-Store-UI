import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MediaItem } from '@/types'
import { LazyImage } from '@/components/ui/LazyImage'
import { PriceTag } from '@/components/PriceTag'
import { Button } from '@/components/ui/button'
import { tmdbImage, truncate } from '@/utils/format'
import { cn } from '@/utils/cn'

interface FeaturedCarouselProps {
  items: MediaItem[]
  loading?: boolean
}

/**
 * FeaturedCarousel - the Steam-style home page hero. Auto-advances every few
 * seconds (paused on hover / focus and when the user prefers reduced motion),
 * with manual prev/next controls and dot indicators. Each slide is a link to
 * the item detail page.
 */
export function FeaturedCarousel({ items, loading }: FeaturedCarouselProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    setIndex(0)
  }, [items])

  useEffect(() => {
    if (paused || items.length <= 1) return
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length)
    }, 6000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [paused, items.length])

  const go = (dir: 1 | -1) => {
    setIndex((i) => (i + dir + items.length) % items.length)
  }

  if (loading) {
    return <div className="skeleton h-[320px] w-full rounded-lg sm:h-[420px]" />
  }

  if (items.length === 0) {
    return (
      <div className="flex h-[320px] w-full items-center justify-center rounded-lg bg-steam-panel text-steam-textdim sm:h-[420px]">
        No featured titles available.
      </div>
    )
  }

  const current = items[index]

  return (
    <div
      className="relative h-[320px] w-full overflow-hidden rounded-lg sm:h-[420px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured titles"
    >
      {items.map((item, i) => (
        <div
          key={item.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            i === index ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          aria-hidden={i !== index}
        >
          <LazyImage
            src={tmdbImage(item.backdropImage ?? item.headerImage, 'w1280')}
            alt={item.title}
            wrapperClassName="h-full w-full"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-steam-bg via-steam-bg/50 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-widest text-steam-blue">Featured</p>
            <h2 className="mt-1 text-2xl font-bold text-white sm:text-4xl">{current.title}</h2>
            <p className="mt-2 max-w-xl text-sm text-steam-text/90">{truncate(current.shortDescription, 160)}</p>
          </div>
          <div className="flex items-center gap-4">
            <PriceTag price={current.price} discountPercent={current.discountPercent} size="lg" />
            <Button asChild variant="primary">
              <Link to={`/app/${current.id}`}>View details</Link>
            </Button>
          </div>
        </div>

        {/* Controls + dots */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="bg-black/30 hover:bg-black/50"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="bg-black/30 hover:bg-black/50"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex gap-1.5" role="tablist" aria-label="Slide selector">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steam-blue',
                  i === index ? 'w-6 bg-steam-blue' : 'w-2 bg-white/40 hover:bg-white/70',
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
