# Current Feature

## Status

Not Started

## Goals

## Notes

## History

### Feature 21 — TV Show Support on Discover

- `TmdbTvResult`, `TmdbTvListResponse`, `TmdbTvDetail`, `TmdbTvDetailMapped` interfaces added to `tmdb.model.ts`; `TmdbTvDetail` extended with `credits?`; `TmdbTvDetailMapped` extended with `cast`, `directors`, `writers`
- `mediaType?: 'movie' | 'tv'` added to `TmdbMovie` and `Movie` models
- `trendingTv`, `popularTv`, `tvGenres`, `tvDetail` signals (+ loading/error variants) added to `TmdbService`
- `fetchTvGenres()`, `fetchTrendingTv()`, `fetchPopularTv()`, `fetchTvDetail()`, `fetchTvWatchProviders()`, `loadMoreTrendingTv()`, `loadMorePopularTv()` methods added to `TmdbService`; `mapTv()` and `mapTvDetail()` private methods extract credits (cast, directors, writers)
- Movies/TV tab switcher added to `DiscoverPage`; `activeTab` signal synced from/to URL (`?type=tv` / `?type=movie`); TV genres and grids fetched lazily on first tab activation
- Tab styles added to `discover.page.scss`: `.discover-tabs`, `.discover-tab`, `.discover-tab--active`
- `TmdbCardComponent` and `MovieCardComponent` updated with `detailRoute` computed signal — routes to `/discover/tv/:id` when `mediaType === 'tv'`, otherwise `/discover/movie/:id`
- New `discover-tv-detail.page.ts/html/scss` at `/discover/tv/:tmdbId`: backdrop, metadata (seasons, episodes, runtime), cast grid, Where to Watch, Add to Watchlist
- TV shows stored in watchlist with `type: 'series'` and `mediaType: 'tv'`; watchlist card routing works without watchlist service changes
- Route `tv/:tmdbId` added to `discover.routes.ts`

### Feature 20 — Pagination / Load More

- `trendingPage`, `trendingTotalPages`, `popularPage`, `popularTotalPages`, `topRatedPage`, `topRatedTotalPages`, `upcomingPage`, `upcomingTotalPages`, `nowPlayingPage`, `nowPlayingTotalPages`, `discoverPage`, `discoverTotalPages` signals added to `TmdbService`
- All 6 `fetch*()` methods updated to accept a `page` param — replaces list on `page === 1`, appends on `page > 1`
- `loadMoreTrending()`, `loadMorePopular()`, `loadMoreTopRated()`, `loadMoreUpcoming()`, `loadMoreNowPlaying()`, `loadMoreDiscover()` methods added to `TmdbService`; `lastDiscoverParams` stored so `loadMoreDiscover()` re-uses the active filter state
- 6 `loadMore*` delegate methods added to `DiscoverPage`
- "Load More" button added after each grid in `discover.page.html`; hidden while loading or on last page; secondary spinner shown while appending
- Button styles added to `discover.page.scss`: `.discover-section__load-more` (centered flex) + `.discover__load-more-btn` (outlined, accent on hover)

### Feature 19 — Additional Discover Sections

- `releaseDate?: string` added to `TmdbMovie` model, mapped from `release_date` in `mapMovie()`
- `topRated`, `upcoming`, `nowPlaying` signals (+ loading/error variants) added to `TmdbService`
- `fetchTopRated()`, `fetchUpcoming()`, `fetchNowPlaying()` methods added to `TmdbService` — all follow the same pattern as `fetchPopular()`
- `DiscoverPage` constructor calls all three new fetch methods on init
- Three new sections added to `discover.page.html` after "Popular Right Now": **Top Rated**, **Now Playing**, **Coming Soon**

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

### Feature 12 — Genre Tags on Discover Cards

- `TmdbMovie` model extended with optional `genres?: string[]` field
- `mapMovie()` in `TmdbService` now resolves `genre_ids` to names via the existing genres map, sliced to 2 max
- `TmdbCardComponent` renders 1–2 uppercase pill tags beneath the year/rating row
- Zero new API calls — uses genre data already fetched by `fetchGenres()` on Discover page init

### Feature 13 — Movie Trailers on Detail Page

- `TmdbVideo` and `TmdbVideoListResponse` interfaces added to `tmdb.model.ts`
- `trailerKey` signal + `fetchVideos()` method added to `TmdbService`; prefers official YouTube trailers, falls back to any YouTube trailer
- `fetchVideos()` called alongside `fetchMovieDetail()` in `DiscoverDetailPage`'s route effect; resets on navigation
- `showTrailer` signal + `openTrailer()` / `closeTrailer()` methods on `DiscoverDetailPage`
- `SafeUrlPipe` created at `src/app/shared/pipes/safe-url.pipe.ts` to bypass Angular's iframe src sanitization
- "Watch Trailer" (outlined) and "Add to Watchlist" (filled) sit side-by-side in a flex actions row
- Modal dismisses via close button, backdrop click, or Escape key (backdrop receives programmatic focus on open)

### Feature 14 — Migrate Search from OMDB to TMDB

- `TmdbMultiSearchResult` / `TmdbMultiSearchResponse` added to `tmdb.model.ts`
- `Movie` model rewritten: `imdbID: string` → `tmdbId: number`; `source?` / `backdrop?` removed; `MovieDetail` interface deleted
- `MovieService` rewritten: OMDB HTTP calls replaced with TMDB `/search/multi`; `fetchMovieDetail()` and all detail signals removed
- `WatchlistService`: `watchlistIds` → `Set<number>`; `add()` deduplicates by `tmdbId`; `remove()` takes `number`; localStorage guard filters out pre-migration entries
- `MovieCardComponent`: routes to `/discover/movie/:tmdbId`; `removeFromWatchlist` output emits `number`
- `DiscoverDetailPage`: `addToWatchlist()` uses `tmdbId`; `canAddToWatchlist` no longer gated on `imdb_id` — all titles watchlist-able
- Deleted: `omdb.model.ts`, `movie-detail.page.ts/html/scss`
- `movies.routes.ts` detail route removed; `environment.ts` OMDB key removed

### Feature 15 — Where to Watch (Streaming Providers)

- `TmdbWatchProvider`, `TmdbWatchProviderResult`, `TmdbWatchProviderResponse` interfaces added to `tmdb.model.ts`
- `watchProviders` signal + `watchProvidersLoading` signal + `fetchWatchProviders(tmdbId)` method added to `TmdbService`; country hardcoded to `'CA'`
- `fetchWatchProviders()` called alongside `fetchMovieDetail()` and `fetchVideos()` in `DiscoverDetailPage`'s route effect
- `providers` computed signal on `DiscoverDetailPage` — returns `{ streaming, rent, link }` capped at 6/4 entries; `null` when no CA data
- Provider logo section added to `discover-detail.page.html` below the hero: Stream row, Rent row, JustWatch attribution link
- Section absent entirely when `providers()` is `null` (unreleased films, no CA data, API errors)
- Provider logo styles added to `discover-detail.page.scss`: `max-width: 900px` aligned with hero, 40×40px rounded logos

### Feature 16 — Cast & Crew on Detail Page

- `TmdbCastMember`, `TmdbCrewMember`, `TmdbCredits`, `TmdbCastMemberMapped` interfaces added to `tmdb.model.ts`; `TmdbMovieDetail` extended with `credits?`; `TmdbMovieDetailMapped` extended with `cast`, `directors`, `writers`
- `fetchMovieDetail()` updated to pass `append_to_response: 'credits'` — no new HTTP call or signal
- `mapDetail()` now sorts cast by billing order, slices to 8, maps photos; extracts directors and deduplicated writers as joined strings
- Cast grid added to `discover-detail.page.html` (above Where to Watch): profile photo or silhouette placeholder, actor name, character name
- Director and Writer crew rows rendered as label + text below the cast grid
- Cast section absent when `detail.cast.length === 0`
- Component style budget in `angular.json` bumped from 6 kB → 10 kB warning (detail page SCSS now 6.56 kB)

### Feature 17 — Discovery Filters (Genre + Sort)

- `discoverResults`, `discoverLoading`, `discoverError` signals + `fetchDiscover(params)` method added to `TmdbService` using TMDB `/discover/movie` endpoint; accepts `genreIds` and `sortBy` params
- `DiscoverPage` gains `selectedGenres`, `sortBy`, `hasFilters` signals; `genreList` computed (alphabetically sorted from existing `genres` map); `toggleGenre()`, `clearFilters()` methods; filter effect auto-fires `fetchDiscover()` when any filter is non-default
- Genre pill row + sort dropdown (Most Popular / Highest Rated / Newest First / Highest Grossing) rendered above Trending/Popular grids
- "Browse Results" section appears above grids when any filter is active; hidden entirely when cleared
- `--cv-accent-rgb: 230, 168, 23` CSS variable added to `_variables.scss` for the semi-transparent active pill background

### Feature 18 — Similar Movies on Detail Page

- `similar` signal + `similarLoading` signal + `fetchSimilar(tmdbId)` method added to `TmdbService` using TMDB `/movie/:id/recommendations` endpoint; slices to 8 results
- `fetchSimilar()` called alongside other fetches in `DiscoverDetailPage`'s route effect; `similar` reset to `[]` on each call to prevent stale flash
- `TmdbCardComponent` added to `DiscoverDetailPage` imports — no card changes needed
- "More Like This" section added to `discover-detail.page.html` below Where to Watch, guarded by `@if (tmdbService.similar().length)`
- Grid layout on desktop (auto-fill `minmax(140px, 1fr)`); horizontal scroll on mobile (<480px) with hidden scrollbar
