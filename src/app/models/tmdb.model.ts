// Raw API shapes from TMDB
export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbMovieResult {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

export interface TmdbMovieListResponse {
  page: number;
  results: TmdbMovieResult[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenreListResponse {
  genres: TmdbGenre[];
}

export interface TmdbMovieDetail {
  id: number;
  imdb_id: string | null;
  title: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
  genres: TmdbGenre[];
  runtime: number | null;
  tagline: string;
  status: string;
  original_language: string;
}

// App-level mapped types
export interface TmdbMovie {
  tmdbId: number;
  title: string;
  year: string;
  poster: string;
  backdrop: string;
  rating: string;
  overview: string;
}

export interface TmdbMovieDetailMapped {
  tmdbId: number;
  imdbId: string | null;
  title: string;
  year: string;
  poster: string;
  backdrop: string;
  rating: string;
  overview: string;
  genres: string;
  runtime: string;
  tagline: string;
  status: string;
  language: string;
}
