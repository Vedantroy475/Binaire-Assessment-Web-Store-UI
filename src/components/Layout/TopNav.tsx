import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Search, ShoppingCart, User, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { useAuth } from '@/auth/AuthContext'
import { AuthModal } from '@/components/Auth/AuthModal'

/**
 * TopNav - the store's global header, mirroring the Steam store header:
 * logo, main nav links, a search field and the account / cart controls.
 */

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/new-releases', label: 'New Releases' },
  { to: '/categories', label: 'Categories' },
]

export function TopNav() {
  const [authOpen, setAuthOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors',
      'hover:text-steam-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steam-blue focus-visible:ring-offset-2 focus-visible:ring-offset-steam-header rounded-sm',
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className={cn(
                'h-9 w-full rounded-sm border border-steam-blue/30 bg-steam-blue/10 pl-9 pr-3 text-sm text-steam-text',
                'placeholder:text-steam-textdim hover:border-steam-blue/60',
                'focus-visible:outline-none focus-visible:border-steam-blue focus-visible:ring-1 focus-visible:ring-steam-blue',
              )}
            />
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
                    'rounded-sm px-3 py-2 text-sm font-semibold',
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
