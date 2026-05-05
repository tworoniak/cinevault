import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Movie, MovieDetail } from '../../models/movie.model';
import { OmdbSearchResponse, OmdbDetailResponse } from '../../models/omdb.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://www.omdbapi.com/';
  private readonly apiKey = environment.omdbApiKey;

  movies = signal<Movie[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  movieDetail = signal<MovieDetail | null>(null);
  detailLoading = signal(false);
  detailError = signal<string | null>(null);

  searchMovies(query: string) {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<OmdbSearchResponse>(`${this.apiUrl}?s=${query}&apikey=${this.apiKey}`).subscribe({
      next: (res) => {
        this.movies.set(
          (res.Search ?? []).map((m) => ({
            imdbID: m.imdbID,
            title: m.Title,
            year: m.Year,
            poster: m.Poster,
            type: m.Type,
          }))
        );
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to fetch movies. Please try again.');
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  fetchMovieDetail(imdbID: string) {
    this.movieDetail.set(null);
    this.detailLoading.set(true);
    this.detailError.set(null);

    this.http.get<OmdbDetailResponse>(`${this.apiUrl}?i=${imdbID}&apikey=${this.apiKey}`).subscribe({
      next: (res) => {
        this.movieDetail.set({
          imdbID: res.imdbID,
          title: res.Title,
          year: res.Year,
          poster: res.Poster,
          type: res.Type,
          plot: res.Plot,
          director: res.Director,
          actors: res.Actors,
          genre: res.Genre,
          runtime: res.Runtime,
          rating: res.imdbRating,
          rated: res.Rated,
          released: res.Released,
        });
        this.detailLoading.set(false);
      },
      error: (err) => {
        this.detailError.set('Failed to load movie details. Please try again.');
        console.error(err);
        this.detailLoading.set(false);
      },
    });
  }
}
