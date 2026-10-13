import { Link } from 'react-router-dom'
import type { MediaItem } from '@/types'
import { LazyImage } from '@/components/ui/LazyImage'
import { PriceTag } from '@/components/PriceTag'
import { tmdbImage } from '@/utils/format'
import { cn } from '@/utils/cn'

interface MediaCardProps {
  item: MediaItem
  className?: string
}

/** Small platform glyphs derived from the item's platform list. */
function PlatformIcons({ platforms }: { platforms: string[] }) {
  const label: Record<string, string> = {
    windows: 'Windows',
    mac: 'macOS',
    linux: 'Linux',
  }
  return (
    <span className="flex items-center gap-1 text-[10px] text-steam-textdim">
      {platforms.map((p) => (
        <span key={p} title={label[p] ?? p} aria-label={label[p] ?? p}>
          {p === 'windows' ? '🪟' : p === 'mac' ? '' : '🐧'}
        </span>
      ))}
    </span>
  )
}

/**
 * MediaCard - the Steam store product card. Shows the capsule image, title,
 * price (with sale badge), platform icons and top tags. Hover / focus states
 * are explicitly styled. The whole card is a keyboard-focusable link.
 */
export function MediaCard({ item, className }: MediaCardProps) {
  const capsule = tmdbImage(item.capsuleImage, 'w342') ?? '/placeholder-card.svg'
  const header = tmdbImage(item.headerImage, 'w780') ?? capsule

  return (
    <Link
      to={`/app/${item.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded bg-steam-card transition-all duration-200',
        'hover:bg-steam-cardhover hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steam-blue',
        className,
      )}
      aria-label={`${item.title} - view details`}
    >
      {/* Capsule image */}
      <div className="relative aspect-[460/215] w-full overflow-hidden bg-steam-header">
        <LazyImage
          src={capsule}
          alt={item.title}
          wrapperClassName="h-full w-full"
          className="transition-transform duration-300 group-hover:scale-105"
        />
        {item.discountPercent > 0 && (
          <span className="absolute left-0 top-2 bg-steam-green px-2 py-0.5 text-xs font-bold text-steam-pricegreen">
            -{item.discountPercent}%
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-steam-text group-hover:text-white group-hover:font-bold">
            {item.title}
          </h3>
          <PlatformIcons platforms={item.platforms} />
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded bg-steam-blue/10 px-1.5 py-0.5 text-[10px] text-steam-blue"
              >
                {tag}
              </span>
            ))}
          </div>
          <PriceTag price={item.price} discountPercent={item.discountPercent} size="sm" />
        </div>
      </div>

      {/* hidden wide image used for richer hover previews / SEO */}
      <meta itemProp="image" content={header} />
    </Link>
  )
}
