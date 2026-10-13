/**
 * Centralised, typed access to environment configuration.
 *
 * Vite only exposes variables prefixed with `VITE_` on `import.meta.env`.
 * These are baked into the client bundle at build time (this is a pure
 * client-side SPA - no server side rendering is used).
 */

export interface TmdbConfig {
  accessToken: string
  apiKey: string
  baseUrl: string
  imageBaseUrl: string
}

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

const env = import.meta.env

export const tmdbConfig: TmdbConfig = {
  accessToken: env.VITE_TMDB_ACCESS_TOKEN ?? '',
  apiKey: env.VITE_TMDB_API_KEY ?? '',
  baseUrl: env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  imageBaseUrl: env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p',
}

export const firebaseConfig: FirebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: env.VITE_FIREBASE_APP_ID ?? '',
}

/** True when we have at least one way to authenticate with TMDB. */
export const hasTmdbCredentials = (): boolean =>
  Boolean(tmdbConfig.accessToken || tmdbConfig.apiKey)

/** True when the Firebase config looks complete enough to initialise. */
export const hasFirebaseConfig = (): boolean =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId)
