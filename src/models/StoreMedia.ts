import type {
  MediaItem,
  TmdbMovieSummary,
  TmdbMovieDetails,
} from '@/types'
import { seededRandom } from '@/utils/format'

/**
 * Domain model for a storefront item.
 *
 * TMDB provides movie data (no prices / discounts / platforms), so this class
 * derives deterministic, stable "store" attributes (price, discount, platform
 * flags, developer/publisher) from the movie id. This keeps the Steam-style UI
 * consistent across reloads while still being driven by real TMDB content.
 */
export class StoreMedia {
  readonly data: MediaItem

  private constructor(source: MediaItem) {
    this.data = source
  }

  /* ---------- static factory ---------- */
  static fromSummary(source: TmdbMovieSummary): StoreMedia {
    return new StoreMedia(StoreMedia.mapToMediaItem(source))
  }

  static fromDetails(source: TmdbMovieDetails): StoreMedia {
    const item = StoreMedia.mapToMediaItem(source)
    // The detail endpoint gives us real genres, companies and a tagline, so we
    // enrich the base mapping instead of inventing placeholder tags.
    const genreNames = source.genres.map((g) => g.name)
    item.tags = genreNames
    item.genres = genreNames
    item.shortDescription = source.tagline || item.shortDescription
    item.description = source.overview || item.description
    if (source.production_companies.length > 0) {
      item.developer = source.production_companies[0].name
      item.publisher = source.production_companies[0].name
    }
    return new StoreMedia(item)
  }

  /* ---------- mapping ---------- */
  private static mapToMediaItem(source: TmdbMovieSummary): MediaItem {
    const id = source.id
    const seed = seededRandom(id)
    const seed2 = seededRandom(id + 1337)

    // Deterministic price between ~$5 and ~$70, rounded to .99
    const price = Math.round((5 + seed * 65) * 100) / 100
    const roundedPrice = Math.floor(price) + 0.99

    // ~45% of items are on sale, discount between -10% and -75%
    const onSale = seed2 > 0.55
    const discountPercent = onSale ? Math.round(10 + seededRandom(id + 7) * 65) : 0

    const releaseDate = source.release_date || null
    const releaseTimestamp = releaseDate ? new Date(releaseDate).getTime() : 0

    return {
      id,
      type: 'game',
      title: source.title || source.original_title,
      shortDescription: source.overview.slice(0, 120) || '',
      description: source.overview || '',
      tags: (source.genre_ids || []).map((gid) => `Genre ${gid}`), // replaced when details/genres known
      capsuleImage: source.poster_path,
      headerImage: source.backdrop_path || source.poster_path,
      backdropImage: source.backdrop_path,
      releaseDate,
      releaseTimestamp,
      rating: source.vote_average,
      reviewCount: source.vote_count,
      popularity: source.popularity,
      price: roundedPrice,
      discountPercent,
      platforms: StoreMedia.derivePlatforms(id),
      developer: 'Indie Studio',
      publisher: 'Indie Publisher',
      genres: [],
    }
  }

  private static derivePlatforms(id: number): string[] {
    const rand = seededRandom(id + 99)
    const platforms = ['windows']
    if (rand > 0.3) platforms.push('mac')
    if (rand > 0.6) platforms.push('linux')
    return platforms
  }

  /* ---------- instance behaviour ---------- */
  get id(): number {
    return this.data.id
  }

  /** Final price after discount. */
  get finalPrice(): number {
    if (this.data.discountPercent > 0) {
      const off = this.data.price * (1 - this.data.discountPercent / 100)
      return Math.round(off * 100) / 100
    }
    return this.data.price
  }

  get isFree(): boolean {
    return this.finalPrice <= 0
  }

  get isOnSale(): boolean {
    return this.data.discountPercent > 0
  }

  /** Short label list for a card (top 4 tags). */
  topTags(count = 4): string[] {
    return this.data.tags.slice(0, count)
  }
}
