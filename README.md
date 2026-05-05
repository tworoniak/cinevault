# CineVault

A personal movie tracker built with Angular v21. Search for movies and series via the OMDB API, save them to a local watchlist, and view stats on your dashboard.

## Features

- **Movie Search** — search the OMDB database by title, see posters, year, and type
- **Movie Detail** — view full details: plot, director, cast, genre, runtime, rating
- **Watchlist** — add/remove titles, persisted to localStorage
- **Dashboard** — watchlist stats and recently searched titles

## Stack

- Angular v21 (standalone components, signals, built-in control flow)
- SCSS (dark-mode-first, CSS custom properties)
- OMDB API

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your API key

Copy the environment template and add your key:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

Then edit `src/environments/environment.ts`:

```typescript
export const environment = {
  omdbApiKey: 'your_api_key_here',
};
```

Get a free API key at [omdbapi.com](http://www.omdbapi.com/apikey.aspx). `environment.ts` is gitignored and will never be committed.

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
│   │   └── services/          # MovieService, WatchlistService, StorageService
│   ├── features/
│   │   ├── movies/            # Search and detail pages
│   │   ├── watchlist/         # Watchlist page
│   │   └── dashboard/         # Stats dashboard
│   ├── shared/
│   │   └── components/        # MovieCardComponent and other reusable UI
│   └── models/                # Movie, MovieDetail, OmdbSearchResponse interfaces
└── styles/
    ├── abstracts/             # Variables, mixins
    ├── base/                  # Reset, typography
    └── layout/                # Shell layout
```
