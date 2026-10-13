import type { MediaItem, SortKey, SortOption } from '@/types'

/**
 * Sorting strategies implemented with the Strategy pattern (OOP + polymorphism).
 *
 * Each strategy knows how to compare two {@link MediaItem}s. A context picks
 * the right strategy by key, so new sort orders are added by creating a new
 * class rather than editing switch statements everywhere.
 */

export interface SortStrategy {
  readonly key: SortKey
  readonly label: string
  compare(a: MediaItem, b: MediaItem): number
}

export class ReleaseDateDescStrategy implements SortStrategy {
  readonly key = 'release_desc' as const
  readonly label = 'Release date (newest)'
  compare(a: MediaItem, b: MediaItem): number {
    return b.releaseTimestamp - a.releaseTimestamp
  }
}

export class ReleaseDateAscStrategy implements SortStrategy {
  readonly key = 'release_asc' as const
  readonly label = 'Release date (oldest)'
  compare(a: MediaItem, b: MediaItem): number {
    return a.releaseTimestamp - b.releaseTimestamp
  }
}

export class NameAscStrategy implements SortStrategy {
  readonly key = 'name_asc' as const
  readonly label = 'Name (A-Z)'
  compare(a: MediaItem, b: MediaItem): number {
    return a.title.localeCompare(b.title)
  }
}

export class NameDescStrategy implements SortStrategy {
  readonly key = 'name_desc' as const
  readonly label = 'Name (Z-A)'
  compare(a: MediaItem, b: MediaItem): number {
    return b.title.localeCompare(a.title)
  }
}

export class RatingDescStrategy implements SortStrategy {
  readonly key = 'rating_desc' as const
  readonly label = 'Reviews (best)'
  compare(a: MediaItem, b: MediaItem): number {
    return b.rating - a.rating || b.reviewCount - a.reviewCount
  }
}

export class PriceAscStrategy implements SortStrategy {
  readonly key = 'price_asc' as const
  readonly label = 'Price (low to high)'
  compare(a: MediaItem, b: MediaItem): number {
    return effectivePrice(a) - effectivePrice(b)
  }
}

export class PriceDescStrategy implements SortStrategy {
  readonly key = 'price_desc' as const
  readonly label = 'Price (high to low)'
  compare(a: MediaItem, b: MediaItem): number {
    return effectivePrice(b) - effectivePrice(a)
  }
}

export class DiscountDescStrategy implements SortStrategy {
  readonly key = 'discount_desc' as const
  readonly label = 'Discount (biggest)'
  compare(a: MediaItem, b: MediaItem): number {
    return b.discountPercent - a.discountPercent
  }
}

/** Helper: final (discounted) price of an item. */
export function effectivePrice(item: MediaItem): number {
  if (item.discountPercent > 0) {
    return Math.round(item.price * (1 - item.discountPercent / 100) * 100) / 100
  }
  return item.price
}

/** Context that applies a chosen strategy to a list. */
export class SortContext {
  private strategy: SortStrategy

  constructor(strategy: SortStrategy) {
    this.strategy = strategy
  }

  setStrategy(strategy: SortStrategy): void {
    this.strategy = strategy
  }

  get current(): SortStrategy {
    return this.strategy
  }

  apply(items: MediaItem[]): MediaItem[] {
    return [...items].sort((a, b) => this.strategy.compare(a, b))
  }
}

const strategies: SortStrategy[] = [
  new ReleaseDateDescStrategy(),
  new ReleaseDateAscStrategy(),
  new NameAscStrategy(),
  new NameDescStrategy(),
  new RatingDescStrategy(),
  new PriceAscStrategy(),
  new PriceDescStrategy(),
  new DiscountDescStrategy(),
]

export function getStrategy(key: SortKey): SortStrategy {
  return strategies.find((s) => s.key === key) ?? strategies[0]
}

export function sortOptions(): SortOption[] {
  return strategies.map((s) => ({ key: s.key, label: s.label }))
}
