import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Movie } from '../../models/movie.model';
import { OmdbSearchResponse } from '../../models/omdb.model';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://www.omdbapi.com/';
  private readonly apiKey = import.meta.env['NG_APP_OMDB_KEY'];

  movies = signal<Movie[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

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
}
