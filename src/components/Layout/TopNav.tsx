import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Search, ShoppingCart, User, LogOut, Menu, X, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { useAuth } from '@/auth/AuthContext'
import { AuthModal } from '@/components/Auth/AuthModal'
import { tmdbApi } from '@/api/TmdbApiClient'
import { tmdbImage } from '@/utils/format'
import type { TmdbMovieSummary } from '@/types'

/**
 * TopNav - the store's global header, mirroring the Steam store header:
 * logo, main nav links, a search field and the account / cart controls.
 */

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/new-releases', label: 'New Releases' },
  { to: '/categories', label: 'Categories' },
]

/** How many live results to show under the search bar. */
const MAX_SUGGESTIONS = 4
/** Debounce (ms) before hitting the TMDB search endpoint while typing. */
const SUGGESTION_DEBOUNCE_MS = 300
/** Minimum characters before live suggestions kick in. */
const MIN_QUERY_LENGTH = 2

export function TopNav() {
  const [authOpen, setAuthOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  // --- Live top-4 suggestions state ---
  const [suggestions, setSuggestions] = useState<TmdbMovieSummary[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestSeqRef = useRef(0)
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  // Debounced TMDB search while typing; only the latest request's results win.
  useEffect(() => {
    const q = query.trim()
    setActiveIndex(-1)
    if (q.length < MIN_QUERY_LENGTH) {
      setSuggestions([])
      setSuggestionsLoading(false)
      setShowSuggestions(false)
      return
    }

    const seq = ++requestSeqRef.current
    setShowSuggestions(true)
    setSuggestionsLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      tmdbApi
        .search(q, 1)
        .then((res) => {
          // Ignore stale responses from an older keystroke.
          if (seq !== requestSeqRef.current) return
          setSuggestions(res.results.slice(0, MAX_SUGGESTIONS))
          setSuggestionsLoading(false)
        })
        .catch(() => {
          // Silently degrade (offline / missing credentials) - no dropdown.
          if (seq !== requestSeqRef.current) return
          setSuggestions([])
          setSuggestionsLoading(false)
          setShowSuggestions(false)
        })
    }, SUGGESTION_DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Clear the blur timer on unmount to avoid setting state after teardown.
  useEffect(
    () => () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
    },
    [],
  )

  const closeSuggestions = () => {
    setShowSuggestions(false)
    setActiveIndex(-1)
  }

  const selectSuggestion = (id: number) => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
    setQuery('')
    setSuggestions([])
    closeSuggestions()
    navigate(`/app/${id}`)
  }

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Enter with a highlighted suggestion goes straight to its detail page.
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      selectSuggestion(suggestions[activeIndex].id)
      return
    }
    const q = query.trim()
    if (q) {
      closeSuggestions()
      navigate(`/search?q=${encodeURIComponent(q)}`)
    }
  }

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Escape') {
      closeSuggestions()
    }
  }

  const onInputBlur = () => {
    // Grace period so a click on a suggestion row (mousedown) wins over blur.
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
    blurTimeoutRef.current = setTimeout(closeSuggestions, 150)
  }

  const onInputFocus = () => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
    if (query.trim().length >= MIN_QUERY_LENGTH) setShowSuggestions(true)
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors',
      'hover:text-white hover:font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steam-blue focus-visible:ring-offset-2 focus-visible:ring-offset-steam-header rounded-sm',
      isActive ? 'text-steam-blue' : 'text-steam-text',
    )

  return (
    <header className="sticky top-0 z-40 bg-steam-header shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steam-blue"
          aria-label="Web Store home"
        >
          <span className="text-xl font-extrabold tracking-tight text-steam-blue">
            WEB<span className="text-steam-text">STORE</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden items-center md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Search */}
        <form onSubmit={onSearch} role="search" className="ml-auto hidden flex-1 max-w-md sm:flex">
          <label htmlFor="global-search" className="sr-only">
            Search the store
          </label>
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steam-textdim"
              aria-hidden="true"
            />
            <input
              id="global-search"
              type="search"
              role="combobox"
              aria-expanded={showSuggestions && suggestions.length > 0}
              aria-controls="search-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 && suggestions[activeIndex]
                  ? `search-suggestion-${suggestions[activeIndex].id}`
                  : undefined
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
              placeholder="Search"
              className={cn(
                'h-9 w-full rounded-sm border border-steam-blue/30 bg-steam-blue/10 pl-9 pr-3 text-sm text-steam-text',
                'placeholder:text-steam-textdim hover:border-steam-blue/60',
                'focus-visible:outline-none focus-visible:border-steam-blue focus-visible:ring-1 focus-visible:ring-steam-blue',
              )}
            />

            {/* Live top-4 suggestions dropdown */}
            {showSuggestions && query.trim().length >= MIN_QUERY_LENGTH && (
              <ul
                id="search-suggestions"
                role="listbox"
                aria-label="Search suggestions"
                className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-sm border border-steam-blue/30 bg-steam-card shadow-xl"
              >
                {suggestionsLoading && suggestions.length === 0 ? (
                  <li role="presentation" className="px-3 py-2 text-xs text-steam-textdim">
                    Searching…
                  </li>
                ) : suggestions.length === 0 ? (
                  <li role="presentation" className="px-3 py-2 text-xs text-steam-textdim">
                    No results found.
                  </li>
                ) : (
                  suggestions.map((movie, index) => {
                    const poster = tmdbImage(movie.poster_path, 'w92')
                    return (
                      <li
                        key={movie.id}
                        id={`search-suggestion-${movie.id}`}
                        role="option"
                        aria-selected={index === activeIndex}
                      >
                        <button
                          type="button"
                          tabIndex={-1}
                          // mousedown fires before the input's blur, so the
                          // 150ms blur grace period never cancels navigation.
                          onMouseDown={(e) => {
                            e.preventDefault()
                            selectSuggestion(movie.id)
                          }}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={cn(
                            'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                            index === activeIndex ? 'bg-steam-blue/20' : 'hover:bg-steam-blue/10',
                          )}
                        >
                          {poster ? (
                            <img
                              src={poster}
                              alt=""
                              loading="lazy"
                              className="h-12 w-8 shrink-0 rounded-sm object-cover"
                            />
                          ) : (
                            <span className="flex h-12 w-8 shrink-0 items-center justify-center rounded-sm bg-steam-blue/10 text-[10px] text-steam-textdim">
                              N/A
                            </span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-steam-text">
                              {movie.title}
                            </span>
                            <span className="block text-xs text-steam-textdim">
                              {movie.release_date ? movie.release_date.slice(0, 4) : 'TBA'} ·{' '}
                              <Star className="inline h-3 w-3 -translate-y-px text-steam-blue" aria-hidden="true" />{' '}
                              {movie.vote_average > 0 ? movie.vote_average.toFixed(1) : '—'}
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })
                )}
              </ul>
            )}
          </div>
        </form>

        {/* Account + cart */}
        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-steam-textdim lg:inline">
                {user.displayName || user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={() => void signOut()} aria-label="Sign out">
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setAuthOpen(true)}>
              <User className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign in</span>
            </Button>
          )}

          <Button variant="ghost" size="icon" aria-label="Cart">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-border bg-steam-header md:hidden"
        >
          <div className="flex flex-col px-4 py-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-sm px-3 py-2 text-sm font-semibold hover:text-white hover:font-bold',
                    isActive ? 'text-steam-blue' : 'text-steam-text',
                  )
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  )
}
