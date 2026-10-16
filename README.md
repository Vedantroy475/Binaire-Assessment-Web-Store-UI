# FreznelAI Assessment — Web Store UI (Steam-inspired)
> **Live Demo:** [https://vedantwebstorebinaire.netlify.app/](https://vedantwebstorebinaire.netlify.app/)

A recreation of a **digital storefront UI** (styled after the Steam store) built as part of the Binaire / Freznel AI assessment. It is a pure client-side Single Page Application that serves movie/data content from **The Movie Database (TMDB)** API and provides **Firebase Authentication** (email/password) for sign-up and sign-in.

Built with **React 18 + TypeScript + Vite + Tailwind CSS + GSAP**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Routes](#routes)
- [Architecture Notes](#architecture-notes)
- [Offline Support](#offline-support)
- [Deployment (Netlify & Firebase Hosting)](#deployment-netlify--firebase-hosting)

---

## Features

- **Storefront home page** with a featured carousel (GSAP animated) and content shelves.
- **New Releases / Explore page** with a client-side **filter sidebar** (genres, price range, on-sale only, minimum rating) and a **sorting dropdown** (release date, name, rating — implemented with the Strategy pattern).
- **Movie detail page** (`/app/:id`) with backdrop gallery, ratings, price tag, add-to-cart and wishlist controls.
- **Live search suggestions in the navbar** — typing 2+ characters in the global search bar shows the **top 4 TMDB results** in a dropdown directly beneath it (poster thumbnail, title, year and rating). Requests are debounced (300 ms) with stale-response guarding, the dropdown is fully keyboard-navigable (`↑`/`↓` to highlight, `Enter` to open, `Escape` to close) with an ARIA combobox pattern, and clicking a suggestion opens that movie's detail page (`/app/:id`). Degrades silently when offline or when TMDB credentials are missing.
- **Search page** with server-side TMDB search plus a client-side scored `SearchEngine` for narrowing loaded results.
- **Categories page** for browsing by genre.
- **Pagination bar** for TMDB's paginated endpoints.
- **Steam-style hover states** — buttons, header/footer nav links, filter labels, text links and movie-card titles transition to **bold white** text on hover, matching the reference storefront.
- **Authentication** — sign-up / sign-in / sign-out via **Firebase Auth (email/password only)**, exposed through a React `AuthContext` and an `AuthModal` dialog. The app degrades gracefully (a friendly notice instead of a crash) when Firebase keys are not configured.
- **Offline support** — every TMDB response is cached in **IndexedDB**; when the network goes down the app serves cache-first data, and a `NetworkStatusBanner` informs the user. Falls back to an in-memory cache if IndexedDB is unavailable (e.g. private browsing).
- **Setup page** (`/setup`) with in-app, copy-paste instructions and live status indicators for the required TMDB and Firebase credentials.
- **Smooth page transitions** powered by **GSAP** (the only animation library permitted by the brief).
- **Lazy-loaded images**, skeleton/loading states, a 404 page, and a responsive layout with mobile-friendly top navigation.

## Tech Stack

| Layer | Technology |
| --- | --- |
| UI | React 18, React Router v6 |
| Language | TypeScript (strict, `tsc -b`) |
| Build tooling | Vite 5 |
| Styling | Tailwind CSS 3, PostCSS, `class-variance-authority`, `tailwind-merge`, `clsx` |
| Component primitives | Radix UI (dialog, dropdown-menu, tabs, checkbox, label) |
| Icons | lucide-react |
| Animation | GSAP 3 |
| Data | TMDB REST API (v3 `api_key` or v4 Bearer access token) |
| Auth | Firebase Authentication (email/password) |
| Persistence | IndexedDB (offline response cache), Firestore rules provided for per-user data |
| Linting | ESLint 9 (flat config) + typescript-eslint |

## Project Structure

```
FreznelAI-Assessment-1/
├── public/                  # Static assets (favicon, placeholders)
├── src/
│   ├── api/
│   │   └── TmdbApiClient.ts # Typed TMDB client: auth, caching, offline fallback
│   ├── auth/
│   │   ├── AuthService.ts   # Firebase email/password wrapper (lazy init)
│   │   └── AuthContext.tsx  # React auth state provider/hook
│   ├── components/          # UI (Layout, MediaCard, Shelf, FilterSidebar, ui/*, ...)
│   ├── config/
│   │   └── env.ts           # Centralised, typed access to import.meta.env
│   ├── filters/
│   │   └── FilterEngine.ts  # Immutable client-side filtering (OOP)
│   ├── hooks/               # useAsyncData, useIntersection, useNetworkStatus
│   ├── models/              # Pagination, StoreMedia models
│   ├── offline/
│   │   ├── NetworkMonitor.ts# Online/offline detection
│   │   └── OfflineCache.ts  # IndexedDB cache with in-memory fallback
│   ├── pages/               # Home, NewReleases, Detail, Search, Categories, Setup, 404
│   ├── search/
│   │   └── SearchEngine.ts  # Client-side scored search
│   ├── sorting/
│   │   └── strategies.ts    # Sort strategies (Strategy pattern)
│   ├── types/               # TMDB + domain type definitions
│   ├── utils/               # cn(), formatting, lazy loader
│   ├── App.tsx              # Route table + GSAP page transitions
│   └── main.tsx             # Entry point
├── .env.example             # Environment variable template
├── firebase.json            # Hosting (SPA rewrites) + Firestore config
├── firestore.rules          # Per-user security rules (deny by default otherwise)
├── netlify.toml             # Netlify SPA redirect rewrites (/ -> /index.html 200)
├── vite.config.ts           # Vite config with '@' -> src alias
└── package.json
```

## Getting Started

### Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **npm** 9+
- A free **TMDB API key/token** — <https://developer.themoviedb.org/docs/getting-started>
- A **Firebase project** with Email/Password auth enabled (optional but recommended; the app still runs without it)

### Installation

```bash
git clone https://github.com/Binaire-0101/FreznelAI-Assessment-1.git
cd FreznelAI-Assessment-1
npm install
```

### Configuration

Copy the environment template and fill in your keys (see below), then start the dev server:

```bash
cp .env.example .env
npm run dev
```

The app opens at **<http://localhost:5173>** (auto-opens by default). You can also visit **<http://localhost:5173/setup>** for step-by-step credential instructions with live status checks.

> **Note:** `.env` is git-ignored — never commit real secrets. Restart `npm run dev` after changing environment variables, since Vite bakes `VITE_*` values into the bundle at build time.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_TMDB_ACCESS_TOKEN` | One of the two TMDB vars | TMDB v4 **API Read Access Token** (sent as `Bearer`, preferred) |
| `VITE_TMDB_API_KEY` | One of the two TMDB vars | TMDB v3 **API Key** (used as `api_key` query param) |
| `VITE_TMDB_BASE_URL` | No | Defaults to `https://api.themoviedb.org/3` |
| `VITE_TMDB_IMAGE_BASE_URL` | No | Defaults to `https://image.tmdb.org/t/p` |
| `VITE_FIREBASE_API_KEY` | For auth | Firebase project settings → General |
| `VITE_FIREBASE_AUTH_DOMAIN` | For auth | e.g. `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | For auth | Firebase project id |
| `VITE_FIREBASE_STORAGE_BUCKET` | For auth | e.g. `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | For auth | Sender id |
| `VITE_FIREBASE_APP_ID` | For auth | Firebase app id |

**TMDB:** create an account at <https://www.themoviedb.org/signup>, then **Settings → API** and copy the *API Read Access Token* (v4) or the *API Key* (v3).

**Firebase:** create a project, add a Web app, copy the config values, then enable **Authentication → Sign-in method → Email/Password**.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server (port 5173, opens browser) |
| `npm run build` | Type-check with `tsc -b` and build production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint over the project |
| `npm run typecheck` | Type-check only (`tsc -b --noEmit`) |

## Routes

| Path | Page | Description |
| --- | --- | --- |
| `/` | `HomePage` | Featured carousel + shelves |
| `/new-releases` | `NewReleasesPage` | Explore grid with filters & sorting |
| `/categories` | `CategoriesPage` | Browse by genre |
| `/app/:id` | `DetailPage` | Movie details, gallery, cart/wishlist actions |
| `/search` | `SearchPage` | TMDB-backed search results |
| `/setup` | `SetupPage` | Credential setup instructions & status |
| `*` | `NotFoundPage` | 404 |

## Architecture Notes

- **OOP data layer:** `TmdbApiClient`, `AuthService`, `FilterEngine`, `SearchEngine` and the sorting `strategies` are plain classes — all data/business logic lives outside React components, as required by the brief.
- **Strategy pattern** for sorting: add a new order by creating a class implementing `SortStrategy`, without editing existing switch statements everywhere.
- **Single source of env config:** `src/config/env.ts` exposes typed `tmdbConfig` / `firebaseConfig` plus `hasTmdbCredentials()` / `hasFirebaseConfig()` helpers used for graceful degradation.
- **Path alias:** `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).
- **Security:** `firestore.rules` locks the database down by default and only allows an authenticated user to read/write their own `users/{userId}` documents.

## Offline Support

1. `NetworkMonitor` tracks `navigator.onLine` plus online/offline events and feeds `useNetworkStatus`.
2. `TmdbApiClient` transparently writes every successful response into the `webstore-cache` IndexedDB database.
3. When offline, requests are served **cache-first**; previously fetched pages/details remain fully browsable.
4. If IndexedDB is unavailable, the cache falls back to an in-memory `Map` so the app never crashes.
5. `NetworkStatusBanner` surfaces the connection state to the user.

## Deployment (Netlify & Firebase Hosting)

### Netlify Deployment

> **Live Deployment:** [https://vedantwebstorebinaire.netlify.app/](https://vedantwebstorebinaire.netlify.app/)

The project contains a `netlify.toml` file configured for single-page routing:

* **Base directory:** *(leave blank / repo root)*
* **Build command:** `npm run build`
* **Publish directory:** `dist`

All routes are rewritten to `/index.html` via `netlify.toml` so direct URL visits and hard refreshes on `/app/:id` or `/new-releases` resolve seamlessly without 404 errors. Add the necessary `VITE_*` environment variables in the Netlify site settings before deploying.

### Firebase Hosting

The repository also includes `firebase.json` configured for SPA rewrites to `/index.html`:

```bash
npm run build
firebase login
firebase deploy          # or: firebase deploy --only hosting

```

---


### License

Submitted as an assessment deliverable for Binaire / Freznel AI. TMDB data is subject to the [TMDB terms of use](https://www.themoviedb.org/documentation/terms); Firebase is subject to Google's terms.
