import type { FilterState, MediaItem } from '@/types'
import { effectivePrice } from '@/sorting/strategies'

/**
 * FilterEngine - encapsulates all client-side filtering logic for the store
 * (used by the New Releases / Explore page sidebar). Implemented as a class
 * with immutable input, returning a new filtered array (OOP, no side effects).
 */
export class FilterEngine {
  private state: FilterState

  constructor(initial: FilterState) {
    this.state = { ...initial }
  }

  setState(next: Partial<FilterState>): void {
    this.state = { ...this.state, ...next }
  }

  getState(): FilterState {
    return { ...this.state }
  }

  toggleGenre(genre: string): void {
    const has = this.state.genres.includes(genre)
    this.state.genres = has
      ? this.state.genres.filter((g) => g !== genre)
      : [...this.state.genres, genre]
  }

  reset(): void {
    this.state = { genres: [], minPrice: null, maxPrice: null, onSaleOnly: false, minRating: 0 }
  }

  /** Apply the current filter state to a list of items. */
  apply(items: MediaItem[]): MediaItem[] {
    const { genres, minPrice, maxPrice, onSaleOnly, minRating } = this.state
    return items.filter((item) => {
      if (genres.length > 0) {
        const itemTags = new Set([...item.genres, ...item.tags])
        const matches = genres.some((g) => itemTags.has(g))
        if (!matches) return false
      }
      if (onSaleOnly && item.discountPercent <= 0) return false
      if (minRating > 0 && item.rating < minRating) return false

      const price = effectivePrice(item)
      if (minPrice != null && price < minPrice) return false
      if (maxPrice != null && price > maxPrice) return false
      return true
    })
  }
}

/** Default empty filter state factory. */
export function defaultFilterState(): FilterState {
  return { genres: [], minPrice: null, maxPrice: null, onSaleOnly: false, minRating: 0 }
}

/** Count active filters (for the "N filters" badge). */
export function activeFilterCount(state: FilterState): number {
  let count = state.genres.length
  if (state.minPrice != null || state.maxPrice != null) count += 1
  if (state.onSaleOnly) count += 1
  if (state.minRating > 0) count += 1
  return count
}
