# CineVault

A personal movie tracker built with Angular v21. Search and discover movies via the TMDB API, explore curated grids with genre and sort filters, view trailers and cast details, check streaming availability, and save titles to a local watchlist.

## Features

### Search

- Search movies and TV titles via TMDB's multi-search endpoint
- Results show poster, title, year, and type badge
- Each result links directly to its full detail page

### Discover

- **Trending This Week** and **Popular Right Now** grids on the Discover page
- **Genre filter** — multi-select pill tags (alphabetically sorted)
- **Sort** — Most Popular, Highest Rated, Newest First, Highest Grossing
- Browse Results section appears when any filter is active; grids remain visible below

### Movie Detail

- Full-width backdrop banner with poster, metadata (genres, runtime, language, status, tagline, TMDB rating)
- **Watch Trailer** — YouTube embed in a modal (dismissed via button, backdrop click, or Escape)
- **Cast & Crew** — top 8 cast members with profile photos; Director and Writer credits
- **Where to Watch** — streaming and rental provider logos for Canada via JustWatch / TMDB
- **Add to Watchlist** — available on all titles

### Watchlist

- Add and remove titles; persisted to `localStorage`
- Duplicate-prevention at both UI and service levels

### Dashboard

- Watchlist stats: total, movies, series
- Current search results preview

## Stack

- **Angular v21** — standalone components, signals, `effect()`, built-in control flow (`@if`, `@for`)
- **SCSS** — dark-mode-first, CSS custom properties, component-scoped styles
- **TMDB API** — search, discover, movie detail, videos, watch providers, credits

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your API key

Copy the environment template:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

Edit `src/environments/environment.ts` and add your TMDB API key:

```typescript
export const environment = {
  tmdbApiKey: 'your_tmdb_api_key_here',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  tmdbImageBase: 'https://image.tmdb.org/t/p',
};
```

Get a free API key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api). `environment.ts` is gitignored and will never be committed.

### 3. Run the dev server

```bash
ng serve
```

Open [http://localhost:4200](http://localhost:4200).

## Build

```bash
ng build
```

Output is written to `dist/cinevault/`.

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   └── services/          # TmdbService, MovieService, WatchlistService, StorageService
│   ├── features/
│   │   ├── discover/          # Discover page + movie detail page
│   │   ├── movies/            # Search page
│   │   ├── watchlist/         # Watchlist page
│   │   └── dashboard/         # Stats dashboard
│   ├── shared/
│   │   ├── components/        # MovieCardComponent, TmdbCardComponent, NavComponent
│   │   └── pipes/             # SafeUrlPipe
│   └── models/                # Movie, tmdb.model interfaces
└── styles/
    ├── abstracts/             # Variables (_variables.scss includes --cv-* custom properties), mixins
    ├── base/                  # Reset, typography
    └── layout/                # Shell layout
```
