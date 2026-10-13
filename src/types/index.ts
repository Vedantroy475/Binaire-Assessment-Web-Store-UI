/**
 * Type definitions for TMDB API responses and the app's domain models.
 * See: https://developer.themoviedb.org/reference/intro/getting-started
 */

/* ------------------------------------------------------------------ */
/*  Raw TMDB API shapes                                               */
/* ------------------------------------------------------------------ */

export interface TmdbGenre {
  id: number
  name: string
}

export interface TmdbCollection {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
}

export interface TmdbProductionCompany {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
}

export interface TmdbSpokenLanguage {
  english_name: string
  iso_639_1: string
  name: string
}

/** A movie as returned in list/paginated endpoints. */
export interface TmdbMovieSummary {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  adult: boolean
  video: boolean
  original_language: string
  genre_ids: number[]
}

/** A movie as returned by the detail endpoint. */
export interface TmdbMovieDetails extends TmdbMovieSummary {
  tagline: string
  runtime: number | null
  status: string
  budget: number
  revenue: number
  homepage: string | null
  imdb_id: string | null
  genres: TmdbGenre[]
  production_companies: TmdbProductionCompany[]
  spoken_languages: TmdbSpokenLanguage[]
  belongs_to_collection: TmdbCollection | null
}

/** Paginated TMDB response envelope. */
export interface TmdbPaginatedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export type TmdbMovieListResponse = TmdbPaginatedResponse<TmdbMovieSummary>

/** A still image from the `/images` endpoint. */
export interface TmdbImage {
  aspect_ratio: number
  file_path: string
  height: number
  width: number
  vote_average: number
  vote_count: number
}

export interface TmdbImagesResponse {
  id: number
  backdrops: TmdbImage[]
  posters: TmdbImage[]
  logos: TmdbImage[]
}

/* ------------------------------------------------------------------ */
/*  Application display models (mapped from TMDB -> Steam UI)         */
/* ------------------------------------------------------------------ */

export type MediaType = 'game' | 'dlc' | 'demo'

/**
 * The normalised item used across the store UI. Built from TMDB data but
 * shaped to drive a Steam-style storefront (tags, price, discount, etc.).
 */
export interface MediaItem {
  id: number
  type: MediaType
  title: string
  shortDescription: string
  description: string
  tags: string[]
  /** Capsule image (portrait-ish) used on cards. */
  capsuleImage: string | null
  /** Wide header image used on detail hero / shelves. */
  headerImage: string | null
  backdropImage: string | null
  releaseDate: string | null
  /** ISO date string, convenience for sorting. */
  releaseTimestamp: number
  rating: number
  reviewCount: number
  popularity: number
  /** Deterministic pseudo "price" derived from the movie id. */
  price: number
  /** Deterministic pseudo discount percent (0 when not on sale). */
  discountPercent: number
  platforms: string[]
  developer: string
  publisher: string
  genres: string[]
}

/** A single screenshot for the detail page gallery. */
export interface MediaScreenshot {
  id: number
  src: string
  full: string
  width: number
  height: number
}

/** Aggregate used by the detail page. */
export interface MediaDetail extends MediaItem {
  screenshots: MediaScreenshot[]
  runtime: number | null
  homepage: string | null
}

/* ------------------------------------------------------------------ */
/*  Query / interaction models                                        */
/* ------------------------------------------------------------------ */

export type SortKey =
  | 'release_desc'
  | 'release_asc'
  | 'name_asc'
  | 'name_desc'
  | 'rating_desc'
  | 'price_asc'
  | 'price_desc'
  | 'discount_desc'

export interface SortOption {
  key: SortKey
  label: string
}

export interface FilterState {
  genres: string[]
  minPrice: number | null
  maxPrice: number | null
  onSaleOnly: boolean
  minRating: number
}

export interface SearchParams {
  query: string
  page: number
}

export interface PaginationState {
  page: number
  totalPages: number
  totalResults: number
  hasNext: boolean
  hasPrevious: boolean
}

/** Connection status surfaced by the offline module. */
export type ConnectionStatus = 'online' | 'offline'
