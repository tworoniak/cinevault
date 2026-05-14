# Current Feature

## Status

Not Started

## Goals

<!-- Add goals here -->

## Notes

<!-- Add notes here -->

## History

### Feature 36 — Skeleton Loading System

- Global `@keyframes shimmer` + `.skeleton` utility class appended to `src/styles/base/_reset.scss` — sweeps a gradient across using existing `--cv-bg-elevated`/`--cv-bg-surface` tokens, no new colour variables
- `SkeletonCardComponent` created at `src/app/shared/components/skeleton-card/` (ts/html/scss) — mirrors `TmdbCardComponent` layout with 2:3 poster area, two title lines, a meta row; `aria-hidden="true"` on the root
- Home page hero: `hero--loading` spinner replaced with `hero--skeleton` shimmer layout (bg fill + title + subtitle + two action buttons); `hero__skeleton-*` styles added to `home.page.scss`
- 7 home carousels updated with `@if (loading) { skeleton row } @else { real cards }` pattern: Trending This Week, Popular Celebrities, Popular Right Now, Popular TV Shows, Now Playing, Coming Soon, Top Rated; `skeletonItems = Array(6).fill(0)` added to `HomePage`; `SkeletonCardComponent` imported
- Popular Celebrities carousel: skeleton shown while `popularPeopleLoading()` is true; person cards appear in the `@else` branch (no `@if/else` wrapping needed since the cards were already ungated)
- 7 discover section grids updated with skeleton grids replacing initial-load spinners: Trending, Popular, Top Rated, Now Playing, Upcoming (movies), Trending TV, Popular TV; `skeletonItems = Array(8).fill(0)` added to `DiscoverPage`; `SkeletonCardComponent` imported
- Movie detail page: `discover-detail__spinner` replaced with full hero skeleton (backdrop block + poster + meta lines + action buttons); `discover-detail__skeleton-*` styles added to `discover-detail.page.scss`
- TV detail page: same skeleton pattern applied using `tvService.tvDetailLoading()`; `discover-detail__skeleton-*` styles added to `discover-tv-detail.page.scss`
- News section: `news-section__spinner` replaced with `news-skeleton` layout (lead rectangle + 6-card grid); `news-skeleton__*` styles added to `home.page.scss`

### Feature 35 — Low Priority Fixes (L1–L12)

- L1: Meta description + Open Graph (title, description, type, image) + Twitter Card tags added to `src/index.html`
- L2: `Title` service injected into all 8 page components — static titles set in constructors (`Search — CineVault`, `Watchlist — CineVault`, `Dashboard — CineVault`, `Discover — CineVault`, `CineVault`); detail pages set titles in effects after signal populates (`${detail.title} — CineVault`, `${person.name} — CineVault`)
- L3: `TmdbCardComponent` — `[routerLink]` removed from `<article>`; poster wrapped in `<a class="tmdb-card__link">` (the single focusable target); title wrapped in `<a class="tmdb-card__title-link" tabindex="-1" aria-hidden="true">`; `.tmdb-card__link` gains `:focus-visible` ring in SCSS
- L4: Dead `.discover-detail__no-imdb` rule block deleted from `discover-detail.page.scss`
- L5: `MovieService` no longer imports `environment`; `private core = inject(TmdbCoreService)` used for `core.base`, `core.http`, and `core.imageUrl()`
- L6: `aria-label="Hero navigation"` → `"Featured content slideshow navigation"` in `home.page.html`
- L7: `[attr.aria-pressed]="newsService.activeCategory() === cat.id"` added to news filter pill buttons
- L8: `stats.other` removed from `WatchlistService` computed; "Other" stat card removed from `dashboard.page.html`
- L9: `TmdbMovie.backdrop` changed from `backdrop: string` to `backdrop?: string` — reflects that person credit mappings have no backdrop value
- L10: `aria-disabled` "In Watchlist" button in `MovieCardComponent` gains `[attr.aria-describedby]`; paired `.sr-only` `<span>` with matching `[id]` reads "This title is already in your watchlist."
- L11: Born Today age `<p>` gets `[attr.aria-label]="'Turns ' + person.age + ' today'"` — screen readers announce the full label instead of bare number
- L12: JSDoc comment added above `TmdbPersonSearchResponse` noting the type reuse from `TmdbPersonPopular`

### Feature 34 — Medium Priority Fixes (M1–M10)

- M1: Hero banner auto-advances every 7 s via `setInterval` started in constructor; `pauseHeroAutoAdvance()` / `resumeHeroAutoAdvance()` methods bound to `(mouseenter)`/`(mouseleave)`/`(focusin)`/`(focusout)` on the hero `<section>`; interval cancelled via `DestroyRef.onDestroy` — satisfies WCAG 2.2.2
- M2: `clearSearch()` added to `MovieService` (clears `movies` + `totalResults`); search pipeline in `MovieSearchPage` updated — `filter((v) => v.length > 2)` removed, empty input calls `clearSearch()`, 1–2 char inputs silently skipped
- M3: Watchlist empty-state `<p>` now contains `<a routerLink="/movies">Search for movies</a>`; `RouterLink` added to `WatchlistPage` imports
- M4: `lastSearchQuery` + `lastSearchTime` signals added to `MovieService`, set on each successful search; dashboard section heading now shows `Results for "query" · time` via `DatePipe`; `DatePipe` added to `DashboardPage` imports
- M5: `Location` injected into `DiscoverDetailPage` and `DiscoverTvDetailPage`; back `<a routerLink>` replaced with `<button (click)="location.back()">` in both HTML templates; `.discover-detail__back` SCSS gains `background: none; border: none; cursor: pointer; font-family: inherit` button reset
- M6: `activeNewsLabel` computed signal added to `HomePage` — maps `newsService.activeCategory()` to the matching category label; news section `<h2>` now renders `{{ activeNewsLabel() }}` instead of hardcoded "Top News"
- M7: `backdropError` signal added to both detail pages; backdrop `<img>` gets `(error)="backdropError.set(true)"` with a `.discover-detail__backdrop-fallback` dark-placeholder div as fallback; `.discover-detail__backdrop-fallback` style added to `discover-detail.page.scss`; cast photos get `(error)="onCastPhotoError($event)"` (typed method, sets `visibility: hidden` on the broken element); both reset on navigation
- M8: `fetchDiscover()` effect in `DiscoverPage` now returns early when `movieService.genres().size === 0` — prevents firing before the genre map is populated
- M9: `fetchPopularPeople()` in `TmdbPeopleService` guards with `if (this.popularPeople().length > 0) return` — prevents re-fetch on every Home page visit
- M10: `toTmdbCard(item: Movie): TmdbMovie` method added to `HomePage`; watchlist carousel loop uses `@let card = toTmdbCard(item)` instead of an inline object literal — eliminates new-object-per-change-detection-cycle allocation

### Feature 33 — High Priority Fixes (H1–H5)

- H1: `NotFoundPage` created at `src/app/features/home/pages/not-found.page.ts/html/scss`; wildcard `path: '**'` route added as last entry in `app.routes.ts` — unknown paths now show a user-friendly "Page not found" screen with a link back to `/home`
- H2: `fetchBornToday()` in `TmdbPeopleService` now chunks Wikipedia-sourced names into batches of 8 via `bufferCount(8) + concatMap(forkJoin(...))` — serial batches replace a 30-request parallel burst to respect TMDB's 40 req/10 s rate limit; `bornTodayError` signal added; `home.page.html` Born Today section shows error text via `@else if (peopleService.bornTodayError())`; `.home__section-error` style added to `home.page.scss`
- H3: `SafeUrlPipe.transform()` now validates the input URL against `/^https:\/\/www\.youtube\.com\/embed\/[A-Za-z0-9_-]{6,20}(\?.*)?$/` before bypassing Angular's sanitizer — non-matching URLs are replaced with `about:blank`
- H4: `if (this.tvGenres().size > 0) return;` guard added to `fetchTvGenres()` in `TmdbCoreService` — matches the existing pattern on `fetchGenres()`; eliminates redundant HTTP calls on every TV tab switch
- H5: Request ID counters (`private detailRequestId`, `videosRequestId`, `watchProvidersRequestId`, `similarRequestId`) added to `TmdbMovieService`; `private tvDetailRequestId`, `tvWatchProvidersRequestId` added to `TmdbTvService` — each fetch increments its counter and the `subscribe` callback discards the response if the counter has since advanced



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

### Feature 19 — Additional Discover Sections

- `releaseDate?: string` added to `TmdbMovie` model, mapped from `release_date` in `mapMovie()`
- `topRated`, `upcoming`, `nowPlaying` signals (+ loading/error variants) added to `TmdbService`
- `fetchTopRated()`, `fetchUpcoming()`, `fetchNowPlaying()` methods added to `TmdbService` — all follow the same pattern as `fetchPopular()`
- `DiscoverPage` constructor calls all three new fetch methods on init
- Three new sections added to `discover.page.html` after "Popular Right Now": **Top Rated**, **Now Playing**, **Coming Soon**

### Feature 20 — Pagination / Load More

- `trendingPage`, `trendingTotalPages`, `popularPage`, `popularTotalPages`, `topRatedPage`, `topRatedTotalPages`, `upcomingPage`, `upcomingTotalPages`, `nowPlayingPage`, `nowPlayingTotalPages`, `discoverPage`, `discoverTotalPages` signals added to `TmdbService`
- All 6 `fetch*()` methods updated to accept a `page` param — replaces list on `page === 1`, appends on `page > 1`
- `loadMoreTrending()`, `loadMorePopular()`, `loadMoreTopRated()`, `loadMoreUpcoming()`, `loadMoreNowPlaying()`, `loadMoreDiscover()` methods added to `TmdbService`; `lastDiscoverParams` stored so `loadMoreDiscover()` re-uses the active filter state
- 6 `loadMore*` delegate methods added to `DiscoverPage`
- "Load More" button added after each grid in `discover.page.html`; hidden while loading or on last page; secondary spinner shown while appending
- Button styles added to `discover.page.scss`: `.discover-section__load-more` (centered flex) + `.discover__load-more-btn` (outlined, accent on hover)

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

### Feature 22 — Actor Detail Page

- `TmdbPerson`, `TmdbPersonMovieCredit`, `TmdbPersonMovieCreditsResponse` interfaces added to `tmdb.model.ts`
- `personDetail`, `personDetailLoading`, `personDetailError`, `personCredits`, `personCreditsLoading` signals added to `TmdbService`
- `fetchPersonDetail()` and `fetchPersonCredits()` methods added to `TmdbService`; credits filtered to poster-having titles, sorted by `vote_average` descending, sliced to 20
- New `discover-person-detail.page.ts/html/scss` at `/discover/person/:personId`: profile photo (or placeholder), name, born date, birthplace, collapsible biography (Show more / Show less), "Known For" filmography grid
- Cast cards on both movie and TV detail pages wrapped in `[routerLink]="['/discover', 'person', member.id]"` anchor with `.detail-page__cast-link` style (hover accent on name)
- Route `person/:personId` added to `discover.routes.ts`

### Feature 23 — Homepage / Landing Page

- `TmdbTrendingAllResult`, `TmdbTrendingAllResponse`, `TmdbPersonPopularKnownFor`, `TmdbPersonPopular`, `TmdbPersonPopularResponse` interfaces added to `tmdb.model.ts`
- `trendingAll`, `trendingAllLoading`, `popularPeople`, `popularPeopleLoading` signals added to `TmdbService`
- `fetchTrendingAll()` (GET `/trending/all/week`) and `fetchPopularPeople()` (GET `/person/popular`) methods added to `TmdbService`; `mapTrendingAllItem()` private helper maps mixed movie/TV results by `media_type`
- New `HorizontalCarouselComponent` at `shared/components/horizontal-carousel/`: `title` + `seeAllRoute` inputs, `ng-content` card projection, named `[carousel-tabs]` slot, scroll-snap track, prev/next arrow buttons (desktop hover only), constrained to `.cv-container` width
- New `home` feature at `/home`: `home.routes.ts`, `home.page.ts/html/scss` with hero banner (top 5 from `trendingAll`, manual prev/next + dot navigation, `heroIndex` signal, "View Details" + "+ Watchlist" CTAs) and 8 horizontal carousels in order — Trending This Week (All/Movies/TV tab filter), Popular Celebrities (circular avatar cards → `/discover/person/:id`), From Your Watchlist (hidden when empty), Popular Right Now, Popular TV Shows, Now Playing in Theaters, Coming Soon (with release date badge), Top Rated of All Time
- Default route changed from `/movies` → `/home` in `app.routes.ts`; Home link added as first item in desktop nav links and mobile hamburger menu; brand logo now routes to `/home`

### Feature 24 — UI & Accessibility Fixes (High/Medium)

- `.cv-page` horizontal padding removed (`padding: var(--cv-space-6) 0`) in `_layout.scss` — fixes 48 px double inset on `/movies`, `/watchlist`, `/dashboard` where `.cv-container` + `.cv-page` were co-located on the same element
- `.hero__nav-arrow` gains `min-width: 44px; min-height: 44px; display: inline-flex` for WCAG tap target compliance on mobile
- `.hero__dot` refactored: button is now 24×24 px transparent hit area; visual dot rendered via `::after` pseudo-element (8 px inactive, 20 px active pill); `:focus-visible` outline added
- Carousel `prev`/`next` buttons gain `aria-hidden="true" tabindex="-1"` — removes hidden buttons from keyboard tab order
- `:focus-visible` outline (`2px solid var(--cv-accent); outline-offset: 2px`) added to: `TmdbCardComponent`, `MovieCardComponent` (poster link, title link, action button), hero CTAs/arrows/dots/tabs/person cards, carousel see-all link, discover tabs/genre pills/load-more button/clear button, detail page back links/action buttons/cast links/trailer close button, person detail bio toggle
- `NavComponent` updated: `toggleMenu()` focuses first `<a>` inside `#mobile-menu` on open; `closeMenu()` returns focus to `.nav__hamburger`; hamburger `aria-label` now updates dynamically ("Open" / "Close"); mobile watchlist badge gains matching `aria-label`
- Hero "In Watchlist" `<span>` replaced with `<button disabled aria-label="Already in watchlist">` in `home.page.html`
- `<label for="discover-sort" class="sr-only">Sort by</label>` added to `discover.page.html`; select gains `id="discover-sort"`
- `.discover-detail__back` and `.person-detail__back` padding raised to `var(--cv-space-3) var(--cv-space-2)` for larger mobile tap target
- Person detail back link changed from `routerLink="/discover"` to `(click)="location.back()"` via injected `Location`; `RouterLink` import removed from component
- `.detail-page__cast-character` raised from `0.7rem` → `0.75rem`; `.tmdb-card__genre` raised from `0.625rem` → `0.6875rem`
- `outline: none` removed from base `.search-page__input` rule; existing `:focus { border-color }` serves as the fallback for older browsers

### Feature 25 — UI Polish (Low)

- Discover Movies/TV tabs gain `aria-controls="panel-movie"` / `aria-controls="panel-tv"`; content blocks wrapped in `<div role="tabpanel" id="panel-...">` for complete tab relationship
- `.discover-filters` gains `role="group" aria-label="Filter movies"` so genre pills have group context for screen readers
- TV tab shows `"Genre filters are available for Movies only."` notice (`.discover-tv__filter-notice`); `.discover-tv__filter-notice` style added to `discover.page.scss`
- Hero mobile `min-height` raised `300px` → `380px` to prevent content overflow on small screens
- `HorizontalCarouselComponent` `:host` padding reduced to `var(--cv-space-4) 0` on mobile (was `var(--cv-space-6) 0` always) — tightens 64 px inter-carousel gap; `var(--cv-space-6)` restored at `breakpoint-md`
- `scroll-padding-inline: 44px` added to `.carousel__track` at `breakpoint-md + hover` to prevent arrow buttons clipping first/last card
- `[attr.aria-label]="person.name"` removed from person card `<a>` on home page — visible text (name + known-for) now serves as accessible name
- `★` star glyph wrapped in `<span aria-hidden="true">` in hero (`home.page.html`) and `TmdbCardComponent` — screen readers no longer announce "black star"
- `<ul class="tmdb-card__genres">` `aria-label="Genres"` replaced with `aria-hidden="true"` — prevents list-landmark being announced 20+ times across a card grid
- `MovieCardComponent` title `<a>` converted to `<span>`; poster link is now the single focusable navigation target per card; stale `:hover` and `:focus-visible` rules removed from `.movie-card__title`
- Issue 23 (hero spinner centering) confirmed already handled by `@include flex-center` in `.hero--loading` — no code change required

### Feature 26 — Security Fixes (C1–C4)

- `tmdb-auth.interceptor.ts` created in `src/app/core/interceptors/`; registered via `withInterceptors([])` in `app.config.ts`; uses `Authorization: Bearer tmdbReadToken` when set, falls back to `api_key` query param — API key no longer appears in any request URL
- `tmdbReadToken` field added to `environment.ts` and `environment.example.ts`
- `TmdbService.apiKey` field and `api_key` from `params()` helper removed — auth is fully owned by the interceptor
- `MovieService`: URL template literal replaced with clean `HttpParams`; `console.error` removed (was leaking request URL containing API key)
- `discover-detail.page.ts` / `discover-tv-detail.page.ts`: `Number.isFinite(numId) && numId > 0` guard before all fetch calls
- `discover-person-detail.page.ts`: `personId` signal returns `null` for invalid/missing route params; effect guards on `if (!id)`
- `TmdbService.fetchVideos()`: YouTube trailer key validated with `/^[A-Za-z0-9_-]{6,20}$/` before `trailerKey` signal is set

### Feature 27 — Warning Fixes (W1–W9)

- W1: Load guards added to `fetchGenres()`, `fetchPopular()`, `fetchTopRated()`, `fetchNowPlaying()`, `fetchUpcoming()` in `TmdbService` — page=1 calls skip the HTTP request when data is already loaded, eliminating ~8–10 redundant API calls on Home↔Discover navigation
- W2: `takeUntilDestroyed()` added to `DiscoverPage` `queryParams.subscribe()` — the only subscription in the codebase missing explicit cleanup
- W3: `this.tmdbService.watchProviders.set(null)` added to both `DiscoverDetailPage` and `DiscoverTvDetailPage` constructors (before the effect) — eliminates the stale provider flash window between component creation and first effect run
- W4: `this.tmdbService.similar.set([])` added to `DiscoverTvDetailPage` constructor — prevents stale movie "More Like This" data from carrying over to TV detail pages
- W5: `StorageService.set()` and `remove()` wrapped in try/catch — prevents `QuotaExceededError` / `SecurityError` from crashing watchlist add/remove silently
- W6: `$any($event.target).value` replaced with typed `onSortChange(event: Event)` method in `DiscoverPage`; template binding updated to `(change)="onSortChange($event)"`
- W7: Already resolved in Feature 26 (`console.error` was removed from `MovieService`) — skipped
- W8: Hero `[style.backgroundImage]` binding replaced with `<img class="hero__bg">` positioned absolutely inside `.hero` (`object-fit: cover; object-position: center top; z-index: 0`); `.hero__overlay` gains `position: relative; z-index: 1` — eliminates CSS injection risk, enables native lazy loading
- W9: `@let knownFor = personKnownFor(person)` used in `home.page.html` person card loop — method is called once instead of twice per item per change detection cycle

### Feature 28 — Code Quality Fixes (S2–S8)

- S2: Extracted private `mapCredits(credits: TmdbCredits | undefined)` helper returning `{ cast, directors, writers }`; `mapDetail()` and `mapTvDetail()` now share it — eliminates verbatim duplication of cast sort/slice/map + director/writer extraction
- S3: `<div class="home__tabs">` gains `role="tablist"`; each tab button gains `role="tab"` + `[attr.aria-selected]` — matches the correctly structured Discover tabs
- S4: Magic `600` in `HorizontalCarouselComponent.scrollBy()` replaced with `private readonly SCROLL_STEP_PX = 600`
- S5: `hasPoster` plain getter in `MovieCardComponent` converted to `computed(() => ...)` signal; template updated to `hasPoster()`
- S6: `fetchPersonCredits()` rewritten to use `forkJoin` for parallel movie + TV credits fetches; results merged and deduplicated by `tmdbId`, sorted by `vote_average`, sliced to 20; `TmdbPersonTvCredit` / `TmdbPersonTvCreditsResponse` interfaces added to `tmdb.model.ts`
- S7: `trendingTv().length === 0` guard in `DiscoverPage` replaced with `private tvDataFetched = false` boolean flag — prevents re-fetch loop on failed TV tab loads
- S8: `role="dialog"` on mobile nav `div#mobile-menu` changed to `role="navigation"` — removes false focus-trap implication without requiring CDK dependency
- S1 (TmdbService split into 4 focused services) deferred as a separate feature

### Feature 29 — TmdbService Split (S1)

- `TmdbService` 764-line monolith deleted; replaced with 4 focused services composed via Angular DI
- `TmdbCoreService` created with shared utilities: `http`, `base`, `imageUrl()`, `params()`, `mapCredits()`, `genres`/`tvGenres` signals, `fetchGenres()`/`fetchTvGenres()` — genre signals placed here to avoid circular dependency across domain services
- `TmdbMovieService` created; owns all movie/discover/trending-all signals, fetch/loadMore methods, and private mappers; delegates HTTP to `TmdbCoreService`
- `TmdbTvService` created; owns all TV signals, fetch/loadMore methods, and private mappers; `watchProviders`/`watchProvidersLoading` renamed to `tvWatchProviders`/`tvWatchProvidersLoading` — properly resolves the W3 race condition at the source rather than via constructor resets
- `TmdbPeopleService` created; owns person detail, credits (parallel `forkJoin` fetch), and popular people signals/methods
- 5 consumer TS files updated: `DiscoverDetailPage` → `movieService`, `DiscoverTvDetailPage` → `tvService` (removed now-unnecessary `watchProviders.set(null)` and `similar.set([])` resets), `DiscoverPersonDetailPage` → `peopleService`, `DiscoverPage` → `movieService` + `tvService`, `HomePage` → `movieService` + `tvService` + `peopleService`
- 5 consumer HTML templates updated: all `tmdbService.` bindings replaced with correct domain service prefix

### Feature 30 — Born Today Carousel

- `TmdbBornTodayPerson` interface added to `tmdb.model.ts` (id, name, profile_path, known_for_department, known_for, birthday, age)
- `bornToday` + `bornTodayLoading` signals and `fetchBornToday()` added to `TmdbPeopleService`
- `fetchBornToday()` fetches 5 pages of `/person/popular` + 3 pages of `/trending/person/day` (~160 unique IDs after dedup), parallel-fetches all person details via `forkJoin`, filters by today's MM-DD birthday match, calculates age
- `HorizontalCarouselComponent` gains optional `subtitle` input; rendered below the title with `.carousel__subtitle` style
- "Born Today" carousel section added to `home.page.html` after "Popular Celebrities"; conditionally shown when `bornToday().length > 0`; reuses existing `.home__person-card` styles; `.home__person-age` added to `home.page.scss`
- `fetchBornToday()` called in `HomePage` constructor alongside other fetch calls; `bornTodaySubtitle` computed formats "People born on May 7"

### Feature 32 — Critical Fixes (C1–C2)

- C1: `environment.ts` confirmed untracked with no git history; `.gitignore` line 46 covers it — credential rotation recommended as precautionary step
- C2: `StripHtmlPipe` created at `src/app/shared/pipes/strip-html.pipe.ts` using `DOMParser` to strip HTML tags to plain text
- C2: `[innerHTML]="articles[0].excerpt"` binding in `home.page.html` replaced with `{{ articles[0].excerpt | stripHtml }}` — eliminates XSS vector from Guardian API content
- C2: `StripHtmlPipe` added to `HomePage` component imports

### Feature 31 — Entertainment News Section

- `NewsArticle`, `NewsCategory`, `GuardianApiResponse` interfaces added to `src/app/models/news.model.ts`
- `EntertainmentNewsService` created in `src/app/core/services/`; signals: `news`, `newsLoading`, `newsError`, `activeCategory`; `fetchNews(category)` builds Guardian API params per category, maps `GuardianResult[]` → `NewsArticle[]`; `selectCategory()` delegates to `fetchNews()`
- `guardianApiKey` added to `environment.ts` and `environment.example.ts`
- `HomePage` injects `EntertainmentNewsService`, calls `fetchNews('top')` on init; `newsCategories` array of `{ id, label }` objects drives the filter pills
- "Top News" section added to `home.page.html` immediately below the Born Today carousel: lead article (large 16:9 image + headline + excerpt + date), secondary 3-col grid (up to 6 articles), category filter pills; section follows the carousel pattern (`<section>` > `<div class="cv-container">`) so width and padding are consistent
- Styles added to `home.page.scss`: `.news-section`, `.news-section__header/title/spinner/error`, `.news-filters`, `.news-filter__btn/--active`, `.news-lead/img/body/source/title/excerpt/date`, `.news-grid`, `.news-card/img/body/source/title/date`
- `angular.json` component style budget raised from 10 kB → 14 kB warning to accommodate new styles
- Root cause note: never co-locate `cv-container` on the same element as a component SCSS class that sets `padding` with `0` for horizontal sides — the component style overrides the global horizontal padding, causing full-bleed layout on mobile
