import { tmdbConfig } from '@/config/env'

export type ImageSize =
  | 'w92'
  | 'w154'
  | 'w185'
  | 'w342'
  | 'w500'
  | 'w780'
  | 'w1280'
  | 'original'

/**
 * Build a TMDB image URL for a given path and size.
 * Returns null when no path is available so callers can fall back.
 */
export function tmdbImage(path: string | null | undefined, size: ImageSize = 'w500'): string | null {
  if (!path) return null
  const base = tmdbConfig.imageBaseUrl.replace(/\/$/, '')
  return `${base}/${size}${path}`
}

/** Format a price in USD the way Steam formats its prices. */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** "9 Dec, 2020" style date used by Steam. */
export function formatReleaseDate(iso: string | null): string {
  if (!iso) return 'TBA'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'TBA'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Convert TMDB "genre_ids" or "genres" into readable tag strings. */
export function genresToTags(genres: { id: number; name: string }[]): string[] {
  return genres.map((g) => g.name)
}

/** Truncate text to a max length with an ellipsis. */
export function truncate(text: string, max = 140): string {
  if (text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}…`
}

/** Deterministic pseudo-random number in [0,1) from a seed (mulberry-ish hash). */
export function seededRandom(seed: number): number {
  let t = seed + 0x6d2b79f5
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
