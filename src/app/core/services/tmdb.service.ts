import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  TmdbMovie,
  TmdbMovieDetailMapped,
  TmdbMovieListResponse,
  TmdbMovieDetail,
  TmdbGenreListResponse,
} from '../../models/tmdb.model';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private http = inject(HttpClient);
  private base = environment.tmdbBaseUrl;
  private imageBase = environment.tmdbImageBase;
  private apiKey = environment.tmdbApiKey;

  trending = signal<TmdbMovie[]>([]);
  trendingLoading = signal(false);
  trendingError = signal<string | null>(null);

  popular = signal<TmdbMovie[]>([]);
  popularLoading = signal(false);
  popularError = signal<string | null>(null);

  genres = signal<Map<number, string>>(new Map());

  movieDetail = signal<TmdbMovieDetailMapped | null>(null);
  detailLoading = signal(false);
  detailError = signal<string | null>(null);

  imageUrl(path: string | null, size: string): string {
    if (!path) return '';
    return `${this.imageBase}/${size}${path}`;
  }

  fetchGenres(): void {
    this.http
      .get<TmdbGenreListResponse>(`${this.base}/genre/movie/list`, {
        params: this.params(),
      })
      .subscribe({
        next: (res) => {
          const map = new Map<number, string>();
          res.genres.forEach((g) => map.set(g.id, g.name));
          this.genres.set(map);
        },
        error: () => {},
      });
  }

  fetchTrending(): void {
    this.trendingLoading.set(true);
    this.trendingError.set(null);
    this.http
      .get<TmdbMovieListResponse>(`${this.base}/trending/movie/week`, {
        params: this.params(),
      })
      .subscribe({
        next: (res) => {
          this.trending.set(res.results.map((r) => this.mapMovie(r)));
          this.trendingLoading.set(false);
        },
        error: () => {
          this.trendingError.set('Failed to load trending movies.');
          this.trendingLoading.set(false);
        },
      });
  }

  fetchPopular(): void {
    this.popularLoading.set(true);
    this.popularError.set(null);
    this.http
      .get<TmdbMovieListResponse>(`${this.base}/movie/popular`, {
        params: this.params({ page: '1' }),
      })
      .subscribe({
        next: (res) => {
          this.popular.set(res.results.map((r) => this.mapMovie(r)));
          this.popularLoading.set(false);
        },
        error: () => {
          this.popularError.set('Failed to load popular movies.');
          this.popularLoading.set(false);
        },
      });
  }

  fetchMovieDetail(tmdbId: number): void {
    this.detailLoading.set(true);
    this.detailError.set(null);
    this.movieDetail.set(null);
    this.http
      .get<TmdbMovieDetail>(`${this.base}/movie/${tmdbId}`, {
        params: this.params(),
      })
      .subscribe({
        next: (res) => {
          this.movieDetail.set(this.mapDetail(res));
          this.detailLoading.set(false);
        },
        error: () => {
          this.detailError.set('Failed to load movie details.');
          this.detailLoading.set(false);
        },
      });
  }

  private params(extra: Record<string, string> = {}): HttpParams {
    return new HttpParams({ fromObject: { api_key: this.apiKey, ...extra } });
  }

  private mapMovie(r: { id: number; title: string; release_date: string; poster_path: string | null; backdrop_path: string | null; vote_average: number; overview: string }): TmdbMovie {
    return {
      tmdbId: r.id,
      title: r.title,
      year: r.release_date ? r.release_date.substring(0, 4) : '',
      poster: this.imageUrl(r.poster_path, 'w342'),
      backdrop: this.imageUrl(r.backdrop_path, 'w780'),
      rating: r.vote_average.toFixed(1),
      overview: r.overview,
    };
  }

  private mapDetail(r: TmdbMovieDetail): TmdbMovieDetailMapped {
    return {
      tmdbId: r.id,
      imdbId: r.imdb_id,
      title: r.title,
      year: r.release_date ? r.release_date.substring(0, 4) : '',
      poster: this.imageUrl(r.poster_path, 'w342'),
      backdrop: this.imageUrl(r.backdrop_path, 'w1280'),
      rating: r.vote_average.toFixed(1),
      overview: r.overview,
      genres: r.genres.map((g) => g.name).join(', '),
      runtime: r.runtime ? `${r.runtime} min` : 'N/A',
      tagline: r.tagline,
      status: r.status,
      language: r.original_language.toUpperCase(),
    };
  }
}
