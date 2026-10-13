import { Star } from 'lucide-react'
import { cn } from '@/utils/cn'

interface RatingProps {
  /** TMDB vote average (0-10). */
  value: number
  count?: number
  className?: string
}

/**
 * Rating - converts the TMDB 0-10 score into a 5-star display with a numeric
 * review count, matching Steam's "Very Positive" style summary block.
 */
export function Rating({ value, count, className }: RatingProps) {
  // Map 0-10 onto 0-5 stars.
  const stars = (value / 10) * 5
  const rounded = Math.round(stars * 2) / 2

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center" role="img" aria-label={`Rated ${value.toFixed(1)} out of 10`}>
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = rounded >= i
          const half = !filled && rounded >= i - 0.5
          return (
            <Star
              key={i}
              className={cn(
                'h-3.5 w-3.5',
                filled
                  ? 'fill-steam-pricegreen text-steam-pricegreen'
                  : half
                    ? 'fill-steam-pricegreen/50 text-steam-pricegreen/50'
                    : 'fill-none text-steam-textdim/40',
              )}
              aria-hidden="true"
            />
          )
        })}
      </div>
      {count != null && (
        <span className="text-xs text-steam-textdim">
          {count.toLocaleString()} reviews
        </span>
      )}
    </div>
  )
}
