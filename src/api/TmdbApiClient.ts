import { tmdbConfig, hasTmdbCredentials } from '@/config/env'
import { networkMonitor } from '@/offline/NetworkMonitor'
import { offlineCache } from '@/offline/OfflineCache'
import type {
  TmdbMovieDetails,
  TmdbMovieListResponse,
  TmdbImagesResponse,
  TmdbPaginatedResponse,
  TmdbMovieSummary,
} from '@/types'

/**
 * TmdbApiClient
 *
 * A thin, typed wrapper over the TMDB REST API. It implements:
 *  - Auth via either the v4 read access token (Bearer) or the v3 api_key.
 *  - Transparent response caching into IndexedDB via {@link offlineCache} so
 *    that the app keeps working while offline ("full API access" offline).
 *  - Cache-first reads when the network is down.
 *
 * This is a plain class (OOP) as required by the brief - all data access
 * logic lives here rather than inside React components.
 */

export interface TmdbRequestOptions {
  /** Bypass cache and force a network request. */
  fresh?: boolean
  /** Extra query params. */
  params?: Record<string, string | number | boolean | undefined>
  /** Timeout in ms. */
  timeoutMs?: number
}

export class TmdbApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'TmdbApiError'
    this.status = status
  }
}

export class TmdbApiClient {
  private readonly baseUrl: string
  private readonly accessToken: string
  private readonly apiKey: string

  constructor() {
    this.baseUrl = tmdbConfig.baseUrl.replace(/\/$/, '')
    this.accessToken = tmdbConfig.accessToken
    this.apiKey = tmdbConfig.apiKey
  }

  get configured(): boolean {
    return hasTmdbCredentials()
  }

  private buildUrl(path: string, params?: TmdbRequestOptions['params']): string {
    const url = new URL(`${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`)
    if (!this.accessToken && this.apiKey) {
      url.searchParams.set('api_key', this.apiKey)
    }
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '') {
          url.searchParams.set(key, String(value))
        }
      }
    }
    return url.toString()
  }

  private headers(): HeadersInit {
    const headers: Record<string, string> = { accept: 'application/json' }
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`
    }
    return headers
  }

  /** Core request method with caching + offline support. */
  private async request<T>(
    path: string,
    options: TmdbRequestOptions = {},
  ): Promise<T> {
    const url = this.buildUrl(path, options.params)
    const cacheKey = url

    // Offline: serve from cache if we have it.
    if (!networkMonitor.isOnline) {
      const cached = await offlineCache.get<T>(cacheKey)
      if (cached !== undefined) return cached
      throw new TmdbApiError('You are offline and this content is not cached yet.', 0)
    }

    if (!this.configured) {
      throw new TmdbApiError(
        'TMDB credentials are missing. Add VITE_TMDB_ACCESS_TOKEN (or VITE_TMDB_API_KEY) to your .env file.',
        401,
      )
    }

    if (!options.fresh) {
      const cached = await offlineCache.get<T>(cacheKey)
      if (cached !== undefined) {
        // Return cache immediately, but refresh in the background (SWR).
        void this.fetchAndCache<T>(url, cacheKey, options)
        return cached
      }
    }

    return this.fetchAndCache<T>(url, cacheKey, options)
  }

  private async fetchAndCache<T>(
    url: string,
    cacheKey: string,
    options: TmdbRequestOptions,
  ): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000)

    try {
      const response = await fetch(url, {
        headers: this.headers(),
        signal: controller.signal,
      })
      if (!response.ok) {
        const message = await this.safeErrorMessage(response)
        throw new TmdbApiError(message, response.status)
      }
      const data = (await response.json()) as T
      await offlineCache.set(cacheKey, data)
      return data
    } catch (err) {
      const cached = await offlineCache.get<T>(cacheKey)
      if (cached !== undefined) return cached
      throw err
    } finally {
      clearTimeout(timeout)
    }
  }

  private async safeErrorMessage(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as { status_message?: string }
      return body.status_message || `TMDB request failed with status ${response.status}`
    } catch {
      return `TMDB request failed with status ${response.status}`
    }
  }

  /* -------------------- endpoints -------------------- */

  /** Paginated list endpoint (trending, popular, top_rated, upcoming...). */
  movieList(path: string, page = 1): Promise<TmdbMovieListResponse> {
    return this.request<TmdbMovieListResponse>(path, { params: { page, language: 'en-US' } })
  }

  discover(page = 1, sortBy = 'primary_release_date.desc'): Promise<TmdbMovieListResponse> {
    return this.request<TmdbMovieListResponse>('/discover/movie', {
      params: {
        page,
        language: 'en-US',
        sort_by: sortBy,
        include_adult: false,
        'vote_count.gte': 50,
      },
    })
  }

  search(query: string, page = 1): Promise<TmdbMovieListResponse> {
    return this.request<TmdbMovieListResponse>('/search/movie', {
      params: { query, page, language: 'en-US', include_adult: false },
    })
  }

  movieDetails(id: number): Promise<TmdbMovieDetails> {
    return this.request<TmdbMovieDetails>(`/movie/${id}`, {
      params: { language: 'en-US' },
      fresh: true,
    })
  }

  movieImages(id: number): Promise<TmdbImagesResponse> {
    return this.request<TmdbImagesResponse>(`/movie/${id}/images`)
  }

  /** Related/similar titles shown on the detail page. */
  similar(id: number): Promise<TmdbPaginatedResponse<TmdbMovieSummary>> {
    return this.request<TmdbPaginatedResponse<TmdbMovieSummary>>(`/movie/${id}/similar`, {
      params: { language: 'en-US' },
    })
  }

  /* ------- convenience methods used by the Home page shelves ------- */

  trending(): Promise<TmdbMovieListResponse> {
    return this.movieList('/trending/movie/week', 1)
  }

  popular(): Promise<TmdbMovieListResponse> {
    return this.movieList('/movie/popular', 1)
  }

  topRated(): Promise<TmdbMovieListResponse> {
    return this.movieList('/movie/top_rated', 1)
  }

  upcoming(): Promise<TmdbMovieListResponse> {
    return this.movieList('/movie/upcoming', 1)
  }

  nowPlaying(): Promise<TmdbMovieListResponse> {
    return this.movieList('/movie/now_playing', 1)
  }
}

/** Singleton client instance. */
export const tmdbApi = new TmdbApiClient()

