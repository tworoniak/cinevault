export interface Movie {
  imdbID: string;
  title: string;
  year: string;
  poster: string;
  type?: string;
  source?: 'omdb' | 'tmdb';
}

export interface MovieDetail {
  imdbID: string;
  title: string;
  year: string;
  poster: string;
  type: string;
  plot: string;
  director: string;
  actors: string;
  genre: string;
  runtime: string;
  rating: string;
  rated: string;
  released: string;
  backdrop?: string;
  tmdbId?: number;
}
