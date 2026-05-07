// Raw API shapes from TMDB
export interface TmdbMultiSearchResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  vote_average: number;
  overview: string;
}

export interface TmdbMultiSearchResponse {
  page: number;
  results: TmdbMultiSearchResult[];
  total_pages: number;
  total_results: number;
}

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

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TmdbCredits {
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
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
  credits?: TmdbCredits;
}

export interface TmdbTvResult {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

export interface TmdbTvListResponse {
  page: number;
  results: TmdbTvResult[];
  total_pages: number;
  total_results: number;
}

export interface TmdbTvDetail {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
  tagline: string;
  status: string;
  original_language: string;
  number_of_seasons: number;
  number_of_episodes: number;
  genres: { id: number; name: string }[];
  episode_run_time: number[];
  credits?: TmdbCredits;
}

export interface TmdbTvDetailMapped {
  tmdbId: number;
  title: string;
  year: string;
  poster: string;
  backdrop: string;
  rating: string;
  overview: string;
  genres: string;
  tagline: string;
  status: string;
  language: string;
  seasons: number;
  episodes: number;
  runtime: string;
  cast: TmdbCastMemberMapped[];
  directors: string;
  writers: string;
}

// App-level mapped types
export interface TmdbMovie {
  tmdbId: number;
  title: string;
  year: string;
  releaseDate?: string;
  poster: string;
  backdrop: string;
  rating: string;
  overview: string;
  genres?: string[];
  mediaType?: 'movie' | 'tv';
}

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TmdbVideoListResponse {
  id: number;
  results: TmdbVideo[];
}

export interface TmdbWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface TmdbWatchProviderResult {
  link: string;
  flatrate?: TmdbWatchProvider[];
  rent?: TmdbWatchProvider[];
  buy?: TmdbWatchProvider[];
}

export interface TmdbWatchProviderResponse {
  id: number;
  results: Record<string, TmdbWatchProviderResult>;
}

export interface TmdbCastMemberMapped {
  id: number;
  name: string;
  character: string;
  photo: string;
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
  cast: TmdbCastMemberMapped[];
  directors: string;
  writers: string;
}
