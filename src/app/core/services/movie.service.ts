import { Injectable, inject, signal } from '@angular/core';
import { Movie } from '../../models/movie.model';
import { TmdbMultiSearchResponse, TmdbMultiSearchResult } from '../../models/tmdb.model';
import { TmdbCoreService } from './tmdb-core.service';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private core = inject(TmdbCoreService);

  movies = signal<Movie[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  totalResults = signal<number>(0);
  lastSearchQuery = signal<string>('');
  lastSearchTime = signal<Date | null>(null);

  clearSearch(): void {
    this.movies.set([]);
    this.totalResults.set(0);
  }

  searchMovies(query: string) {
    this.loading.set(true);
    this.error.set(null);
    this.totalResults.set(0);

    const url = `${this.core.base}/search/multi`;
    this.core.http.get<TmdbMultiSearchResponse>(url, { params: { query } }).subscribe({
      next: (res) => {
        const results = res.results.filter((r) => r.media_type === 'movie' || r.media_type === 'tv');
        this.movies.set(results.map((r) => this.mapResult(r)));
        this.totalResults.set(res.total_results);
        this.lastSearchQuery.set(query);
        this.lastSearchTime.set(new Date());
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
    const poster = this.core.imageUrl(r.poster_path, 'w342');
    const type = isMovie ? 'movie' : 'series';
    return { tmdbId: r.id, title, year, poster, type };
  }
}
