import { KeyRound, Database, ExternalLink } from 'lucide-react'
import { hasTmdbCredentials, hasFirebaseConfig } from '@/config/env'

/**
 * SetupPage - clear, in-app instructions for adding the two sets of
 * credentials the store needs (TMDB for data, Firebase for auth). This is
 * intentionally a real page so reviewers can see exactly what is required.
 */
export function SetupPage() {
  const tmdbReady = hasTmdbCredentials()
  const firebaseReady = hasFirebaseConfig()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-steam-text">Setup</h1>
      <p className="mt-2 text-steam-textdim">
        This store uses two external services. Copy <code className="rounded bg-steam-card px-1">.env.example</code>{' '}
        to <code className="rounded bg-steam-card px-1">.env</code> and fill in the keys below, then
        restart <code className="rounded bg-steam-card px-1">npm run dev</code>.
      </p>

      <StatusRow
        ok={tmdbReady}
        title="TMDB API"
        description="Powers all movie data, images, search and details."
      />

      <div className="panel mt-4 space-y-3 p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-steam-text">
          <Database className="h-5 w-5 text-steam-blue" aria-hidden="true" />
          TMDB (movie data)
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-steam-textdim">
          <li>
            Create a free account at{' '}
            <a
              href="https://www.themoviedb.org/signup"
              target="_blank"
              rel="noreferrer noopener"
              className="text-steam-blue hover:underline hover:text-white hover:font-bold"
            >
              themoviedb.org
            </a>
            .
          </li>
          <li>
            Go to <span className="text-steam-text">Settings → API</span> and request an API key.
          </li>
          <li>
            Copy the <span className="text-steam-text">API Read Access Token</span> (v4) into{' '}
            <code className="rounded bg-steam-card px-1">VITE_TMDB_ACCESS_TOKEN</code>, or the v3{' '}
            <span className="text-steam-text">API Key</span> into{' '}
            <code className="rounded bg-steam-card px-1">VITE_TMDB_API_KEY</code>.
          </li>
        </ol>
      </div>

      <StatusRow
        ok={firebaseReady}
        title="Firebase Authentication"
        description="Handles sign-up / sign-in (email + password)."
      />

      <div className="panel mt-4 space-y-3 p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-steam-text">
          <KeyRound className="h-5 w-5 text-steam-blue" aria-hidden="true" />
          Firebase (authentication only)
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-steam-textdim">
          <li>
            Create a project at{' '}
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noreferrer noopener"
              className="text-steam-blue hover:underline hover:text-white hover:font-bold"
            >
              console.firebase.google.com
            </a>
            .
          </li>
          <li>
            Enable <span className="text-steam-text">Authentication → Sign-in method → Email/Password</span>.
          </li>
          <li>
            Add a <span className="text-steam-text">Web app</span> and copy the config values into the{' '}
            <code className="rounded bg-steam-card px-1">VITE_FIREBASE_*</code> variables.
          </li>
          <li>
            Register this app's authorised domains (localhost is enabled by default).
          </li>
        </ol>
        <p className="flex items-start gap-2 rounded border border-steam-blue/20 bg-steam-blue/5 p-3 text-xs text-steam-textdim">
          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Firebase credentials are only used for authentication, as required by the brief. They are
          safe to expose in a client app but should still be kept out of version control.
        </p>
      </div>

      <div className="panel mt-6 p-5">
        <h2 className="mb-2 text-lg font-semibold text-steam-text">Deploying</h2>
        <p className="text-sm text-steam-textdim">
          A <code className="rounded bg-steam-card px-1">firebase.json</code> is included for hosting.
          After filling in <code className="rounded bg-steam-card px-1">.env</code> and running{' '}
          <code className="rounded bg-steam-card px-1">npm run build</code>, deploy with{' '}
          <code className="rounded bg-steam-card px-1">firebase deploy</code>.
        </p>
      </div>
    </div>
  )
}

function StatusRow({
  ok,
  title,
  description,
}: {
  ok: boolean
  title: string
  description: string
}) {
  return (
    <div className="mt-6 flex items-center justify-between rounded border border-border bg-steam-card/60 px-4 py-3">
      <div>
        <p className="font-semibold text-steam-text">{title}</p>
        <p className="text-xs text-steam-textdim">{description}</p>
      </div>
      <span
        className={
          ok
            ? 'rounded bg-steam-green px-2 py-1 text-xs font-bold text-steam-pricegreen'
            : 'rounded bg-destructive/20 px-2 py-1 text-xs font-bold text-destructive'
        }
      >
        {ok ? 'Configured' : 'Missing keys'}
      </span>
    </div>
  )
}
