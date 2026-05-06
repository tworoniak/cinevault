# Current Feature: Genre Tags on Discover Cards

## Status

In Progress

## Goals

- Each `TmdbCardComponent` displays 1–2 genre pill tags beneath the movie title
- Makes the Discover grids scannable at a glance without clicking into detail
- Uses data already fetched — no new API calls required

## Notes

- Extend `TmdbMovie` with `genres?: string[]`; resolve IDs inside `mapMovie()` using the existing genre map
- `fetchGenres()` must be called before trending/popular — already the case in `DiscoverPage`, do not reorder
- Limit to 2 genres max on the card to avoid layout overflow on narrow cards
- No change needed to the Detail page — it already resolves genres from the full detail response
- Branch: `feature/genre-tags-on-cards`

## History

### Feature 1 — App Shell & Global Styles

- SCSS architecture with variables, mixins, reset, typography, layout partials
- `NavComponent` with watchlist count badge and active link highlighting
- Replaced Angular CLI default template with `<app-nav />` + `<router-outlet />`
- Wired `styles.scss` to import all partials
- Also scaffolded: all services (Movie, Watchlist, Storage), models (Movie, OmdbSearch), feature route stubs

### Feature 2 — Movie Search (Enhanced)

- `MovieCardComponent` with poster, title, year, type badge, full mode union (`search/watchlist/preview`), `addToWatchlist` / `removeFromWatchlist` outputs
- `MovieSearchPage` refactored to card grid with separate html/scss files
- "Add to Watchlist" wired from card output to `WatchlistService.add()`
- Switched API key from `import.meta.env` to `environment.ts` (gitignored); added `environment.example.ts` template
- Updated `README.md` with correct setup instructions and `coding-standards.md` to reflect environment file pattern

### Feature 3 — Movie Detail

- `OmdbDetailResponse` and `MovieDetail` models added
- `fetchMovieDetail()` with `movieDetail`, `detailLoading`, `detailError` signals in `MovieService`
- `watchlistIds` computed signal in `WatchlistService` for O(1) lookup
- `MovieDetailPage` with hero layout (poster + metadata), Add to Watchlist / in-watchlist states
- Routing fixed: redirect `''` → `'movies'`, movies feature mounted at `/movies` path
- Movie card height equalized via `:host { height: 100% }` propagation

### Feature 4 — Watchlist Page

- `WatchlistPage` implemented with card grid (mode="watchlist"), remove wiring, and empty state
- `MovieCardComponent` gains `inWatchlist` input — shows disabled "✓ In Watchlist" button in search mode
- `WatchlistService.add()` guards against duplicate entries
- Duplicate prevention is both visual (button state) and logical (service-level guard)

### Feature 5 — Dashboard

- `stats` computed added to `WatchlistService` (total, movies, series, other)
- `DashboardPage` with stats bar and recently searched card grid (`mode="preview"`)
- Empty states for both sections
- `tsconfig.app.json` `rootDir` diagnostic fixed

### Feature 6 — Accessibility Fixes

- `.sr-only` utility class added to `_reset.scss`
- Search input: visually-hidden `<label>`, `:focus-visible` outline replaces `outline: none`
- Nav links: explicit `:focus-visible` style
- Nav badge: `aria-label` with item count
- Detail page back link: touch-target padding added
- Movie card "In Watchlist" button: `aria-disabled`/`tabindex` replaces `disabled`; `pointer-events: none` blocks clicks
- Movie card `<article>`: `aria-label` bound to movie title

### Feature 7 — UX Improvements

- Search debounced 300ms via `Subject` pipeline (`debounceTime` + `distinctUntilChanged` + `filter` + `takeUntilDestroyed`)
- Dashboard "Recently Searched" renamed to "Current Search Results"; section hidden when no search has run
- Card hover `transform`/`border-color` wrapped in `@media (hover: hover)` — no sticky state on touch devices

### Feature 8 — Responsive Fixes

- Dashboard stats bar converted from `flex-wrap` to CSS grid: 2-col mobile, 4-col at `breakpoint-md`; `min-width: 100px` removed from stat card
- `card-grid` mixin mobile `minmax` reduced from `160px` → `140px` to allow 3 columns on 414px+ viewports
- `movie-card` `:host` gains `min-width: 0` to prevent CSS grid item overflow
- `.cv-page` padding corrected: `padding: var(--cv-space-6) 0` → `padding: var(--cv-space-6) var(--cv-space-5)` — the `0` was zeroing out `.cv-container`'s horizontal padding since both classes share the same element

### Feature 9 — Visual Polish

- Watchlist and Dashboard page `h1` bumped from `1.5rem` → `1.75rem` to match the Detail page's mobile size
- Unicode `✓` removed from "In your watchlist" (detail page) and "In Watchlist" button (movie card)
- CSS border-trick `::before` pseudo-element added to both — `border-right` + `border-bottom` + `rotate(45deg)`, no glyph, cross-platform consistent

### Feature 10 — UI Improvements

- Mobile nav replaced with hamburger menu (<480px): slide-in panel, animated ☰→✕, backdrop dismiss, auto-close on route change
- Search page gains `<h1>` heading; empty state upgraded with film-strip SVG icon
- Result count label ("Showing X of Y results") from new `totalResults` signal in `MovieService`
- Detail page: "Back to Search" → "Back"; loading text replaced with CSS spinner; hero centered with `max-width: 900px`
- Watchlist Remove button gains inline trash SVG for immediate scannability
- Global: `--cv-space-9/10` variables added; `@keyframes spin` in `_reset.scss`; `.playwright-mcp/` gitignored

### Feature 11 — TMDB Discover

- New `/discover` page with Trending This Week + Popular Right Now card grids via TMDB API
- New `/discover/movie/:tmdbId` detail page with full-width backdrop banner, metadata (genres, runtime, language, status, tagline), TMDB rating, and watchlist bridge via `imdb_id`
- `TmdbCardComponent` — separate from `MovieCardComponent`; routes to `/discover/movie/:tmdbId`; shows poster, title, year, rating ★
- `TmdbService` with signals (`trending`, `popular`, `genres`, `movieDetail` + loading/error variants), HTTP methods, and `imageUrl()` helper
- `tmdb.model.ts` with raw TMDB API shapes and mapped app types (`TmdbMovie`, `TmdbMovieDetailMapped`)
- `movie.model.ts` extended with optional `source?`, `backdrop?`, `tmdbId?` fields (additive only)
- Nav updated: Search | Discover | Watchlist | Dashboard (desktop and mobile hamburger)
- Movies with `imdb_id === null` hide the watchlist button and show "IMDb ID unavailable"
