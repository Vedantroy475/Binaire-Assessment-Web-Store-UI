import type { MediaItem } from '@/types'

/**
 * SearchEngine - client-side fuzzy-ish matching over already loaded items.
 * The server search (TMDB `/search`) is used for the initial query; this class
 * is used to further filter/narrow results by title, description and tags
 * (e.g. inside the store's instant search dropdown).
 */
export class SearchEngine {
  private query = ''

  setQuery(query: string): void {
    this.query = query.trim()
  }

  getQuery(): string {
    return this.query
  }

  /** Score an item against the query (higher = better match, 0 = no match). */
  private score(item: MediaItem, q: string): number {
    const title = item.title.toLowerCase()
    const desc = item.shortDescription.toLowerCase()
    const tags = [...item.tags, ...item.genres].join(' ').toLowerCase()

    if (title === q) return 100
    if (title.startsWith(q)) return 80
    if (title.includes(q)) return 60
    if (tags.includes(q)) return 40
    if (desc.includes(q)) return 20
    return 0
  }

  /** Return matching items, best matches first. */
  search(items: MediaItem[]): MediaItem[] {
    const q = this.query.toLowerCase()
    if (!q) return items
    return items
      .map((item) => ({ item, s: this.score(item, q) }))
      .filter((entry) => entry.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((entry) => entry.item)
  }
}
