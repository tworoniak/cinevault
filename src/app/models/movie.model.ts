export interface Movie {
  tmdbId: number;
  title: string;
  year: string;
  poster: string;
  type: 'movie' | 'series' | 'other';
}
