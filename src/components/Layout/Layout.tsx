import { Outlet } from 'react-router-dom'
import { TopNav } from '@/components/Layout/TopNav'
import { NetworkStatusBanner } from '@/components/NetworkStatusBanner'

/**
 * Layout - the persistent store shell: skip link, top navigation, connection
 * status banner and the routed page content. The footer mirrors the Steam
 * store footer (legal links + Valve-style attribution).
 */
export function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-steam-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-steam-blue focus:px-4 focus:py-2 focus:text-steam-header"
      >
        Skip to main content
      </a>

      <TopNav />
      <NetworkStatusBanner />

      <main id="main-content" className="flex-1">
        {children ?? <Outlet />}
      </main>

      <footer className="mt-10 border-t border-border bg-steam-header">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
            <div>
              <p className="text-sm text-steam-textdim">
                WebStore — a recreation of the Steam store UI for the
                Binaire / FreznelAI assessment. Data provided by TMDB.
              </p>
            </div>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
              {['Privacy Policy', 'Legal', 'Steam Subscriber Agreement', 'Refunds', 'Cookies'].map(
                (item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-xs uppercase tracking-wide text-steam-textdim transition-colors hover:text-white hover:font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steam-blue"
                  >
                    {item}
                  </a>
                ),
              )}
            </nav>
          </div>
          <p className="mt-6 text-xs text-steam-textdim/70">
            © {new Date().getFullYear()} WebStore. All trademarks are property of their respective
            owners. This project is for educational / assessment purposes only.
          </p>
        </div>
      </footer>
    </div>
  )
}
