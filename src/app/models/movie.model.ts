export interface Movie {
  imdbID: string;
  title: string;
  year: string;
  poster: string;
  type?: string;
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
}
