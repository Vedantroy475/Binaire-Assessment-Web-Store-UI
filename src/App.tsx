import { useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { AuthProvider } from '@/auth/AuthContext'
import { Layout } from '@/components/Layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { NewReleasesPage } from '@/pages/NewReleasesPage'
import { DetailPage } from '@/pages/DetailPage'
import { SearchPage } from '@/pages/SearchPage'
import { SetupPage } from '@/pages/SetupPage'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

/**
 * App - application root.
 *
 * Wraps everything in the Firebase-backed {@link AuthProvider}, defines the
 * route table and applies a GSAP page-transition on every route change (the
 * brief requires smooth/pleasant transitions; GSAP is the only animation
 * library allowed).
 */
export default function App() {
  const location = useLocation()

  return (
    <AuthProvider>
      <Layout>
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/new-releases" element={<NewReleasesPage />} />
            <Route path="/app/:id" element={<DetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PageTransition>
      </Layout>
    </AuthProvider>
  )
}

/**
 * PageTransition - wraps each routed page and animates it in with GSAP when
 * mounted (the `key` in App guarantees a remount per route).
 */
function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    gsap.fromTo(
      node,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
    )
  }, [])

  return (
    <div ref={ref} className="min-h-[60vh]">
      {children}
    </div>
  )
}
