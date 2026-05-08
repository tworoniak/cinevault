import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Movie } from '../../models/movie.model';
import { TmdbMultiSearchResponse, TmdbMultiSearchResult } from '../../models/tmdb.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private readonly base = environment.tmdbBaseUrl;
  private readonly imageBase = environment.tmdbImageBase;

  movies = signal<Movie[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  totalResults = signal<number>(0);

  searchMovies(query: string) {
    this.loading.set(true);
    this.error.set(null);
    this.totalResults.set(0);

    const url = `${this.base}/search/multi`;
    this.http.get<TmdbMultiSearchResponse>(url, { params: { query } }).subscribe({
      next: (res) => {
        const results = res.results.filter((r) => r.media_type === 'movie' || r.media_type === 'tv');
        this.movies.set(results.map((r) => this.mapResult(r)));
        this.totalResults.set(res.total_results);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to fetch results. Please try again.');
        this.loading.set(false);
      },
    });
  }

  private mapResult(r: TmdbMultiSearchResult): Movie {
    const isMovie = r.media_type === 'movie';
    const rawDate = isMovie ? r.release_date : r.first_air_date;
    const year = rawDate ? rawDate.slice(0, 4) : '';
    const title = isMovie ? (r.title ?? '') : (r.name ?? '');
    const poster = r.poster_path ? `${this.imageBase}/w342${r.poster_path}` : '';
    const type = isMovie ? 'movie' : 'series';
    return { tmdbId: r.id, title, year, poster, type };
  }
}
