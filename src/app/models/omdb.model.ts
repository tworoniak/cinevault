export interface OmdbMovie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
}

export interface OmdbSearchResponse {
  Search: OmdbMovie[];
  totalResults: string;
  Response: string;
}

export interface OmdbDetailResponse {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
  Plot: string;
  Director: string;
  Actors: string;
  Genre: string;
  Runtime: string;
  imdbRating: string;
  Rated: string;
  Released: string;
  Response: string;
}
