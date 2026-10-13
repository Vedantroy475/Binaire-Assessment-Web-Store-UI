import { cn } from '@/utils/cn'
import { formatPrice } from '@/utils/format'
import { Badge } from '@/components/ui/badge'

interface PriceTagProps {
  price: number
  discountPercent: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * PriceTag - Steam's iconic price block. When an item is on sale it shows the
 * green discount badge, the struck-through original price and the final price
 * in the signature price-green colour.
 */
export function PriceTag({ price, discountPercent, className, size = 'md' }: PriceTagProps) {
  const final = discountPercent > 0 ? Math.round(price * (1 - discountPercent / 100) * 100) / 100 : price
  const onSale = discountPercent > 0

  const priceSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  } as const

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {onSale && (
        <Badge
          variant="discount"
          className={cn(
            'shrink-0',
            size === 'sm' ? 'px-1.5 text-[10px]' : 'px-2',
            size === 'lg' ? 'text-sm' : '',
          )}
        >
          -{discountPercent}%
        </Badge>
      )}
      <div className="flex flex-col items-end leading-tight">
        {onSale && (
          <span
            className={cn(
              'text-steam-textdim line-through',
              size === 'lg' ? 'text-xs' : 'text-[10px]',
            )}
          >
            {formatPrice(price)}
          </span>
        )}
        <span className={cn('font-medium text-steam-pricegreen', priceSizes[size])}>
          {final <= 0 ? 'Free to Play' : formatPrice(final)}
        </span>
      </div>
    </div>
  )
}
