import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-steam-blue">404</p>
      <h1 className="mt-4 text-2xl font-bold text-steam-text">Page not found</h1>
      <p className="mt-2 text-sm text-steam-textdim">
        The page you were looking for doesn't exist or has moved.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-sm bg-steam-blue px-5 py-2 font-semibold text-steam-header transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Back to the store
      </Link>
    </div>
  )
}
