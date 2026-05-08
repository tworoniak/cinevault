import { Injectable, inject, signal } from '@angular/core';
import { TmdbCoreService } from './tmdb-core.service';
import {
  TmdbMovie,
  TmdbTvDetailMapped,
  TmdbTvListResponse,
  TmdbTvResult,
  TmdbTvDetail,
  TmdbWatchProviderResponse,
  TmdbWatchProviderResult,
} from '../../models/tmdb.model';

@Injectable({ providedIn: 'root' })
export class TmdbTvService {
  private core = inject(TmdbCoreService);

  get tvGenres() { return this.core.tvGenres; }
  get watchCountry() { return this.core.watchCountry; }

  fetchTvGenres(): void { this.core.fetchTvGenres(); }

  imageUrl(path: string | null, size: string): string {
    return this.core.imageUrl(path, size);
  }

  trendingTv = signal<TmdbMovie[]>([]);
  trendingTvLoading = signal(false);
  trendingTvError = signal<string | null>(null);
  trendingTvPage = signal(1);
  trendingTvTotalPages = signal(1);

  popularTv = signal<TmdbMovie[]>([]);
  popularTvLoading = signal(false);
  popularTvError = signal<string | null>(null);
  popularTvPage = signal(1);
  popularTvTotalPages = signal(1);

  tvDetail = signal<TmdbTvDetailMapped | null>(null);
  tvDetailLoading = signal(false);
  tvDetailError = signal<string | null>(null);

  tvWatchProviders = signal<TmdbWatchProviderResult | null>(null);
  tvWatchProvidersLoading = signal(false);

  fetchTrendingTv(page = 1): void {
    this.trendingTvLoading.set(true);
    this.trendingTvError.set(null);
    this.core.http
      .get<TmdbTvListResponse>(`${this.core.base}/trending/tv/week`, {
        params: this.core.params({ page: String(page) }),
      })
      .subscribe({
        next: (res) => {
          const mapped = res.results.map((r) => this.mapTv(r));
          this.trendingTv.update((prev) => (page === 1 ? mapped : [...prev, ...mapped]));
          this.trendingTvPage.set(page);
          this.trendingTvTotalPages.set(res.total_pages);
          this.trendingTvLoading.set(false);
        },
        error: () => {
          this.trendingTvError.set('Failed to load trending shows.');
          this.trendingTvLoading.set(false);
        },
      });
  }

  loadMoreTrendingTv(): void {
    const next = this.trendingTvPage() + 1;
    if (next <= this.trendingTvTotalPages()) this.fetchTrendingTv(next);
  }

  fetchPopularTv(page = 1): void {
    this.popularTvLoading.set(true);
    this.popularTvError.set(null);
    this.core.http
      .get<TmdbTvListResponse>(`${this.core.base}/tv/popular`, {
        params: this.core.params({ page: String(page) }),
      })
      .subscribe({
        next: (res) => {
          const mapped = res.results.map((r) => this.mapTv(r));
          this.popularTv.update((prev) => (page === 1 ? mapped : [...prev, ...mapped]));
          this.popularTvPage.set(page);
          this.popularTvTotalPages.set(res.total_pages);
          this.popularTvLoading.set(false);
        },
        error: () => {
          this.popularTvError.set('Failed to load popular shows.');
          this.popularTvLoading.set(false);
        },
      });
  }

  loadMorePopularTv(): void {
    const next = this.popularTvPage() + 1;
    if (next <= this.popularTvTotalPages()) this.fetchPopularTv(next);
  }

  fetchTvDetail(tmdbId: number): void {
    this.tvDetailLoading.set(true);
    this.tvDetailError.set(null);
    this.tvDetail.set(null);
    this.core.http
      .get<TmdbTvDetail>(`${this.core.base}/tv/${tmdbId}`, {
        params: this.core.params({ append_to_response: 'credits' }),
      })
      .subscribe({
        next: (res) => {
          this.tvDetail.set(this.mapTvDetail(res));
          this.tvDetailLoading.set(false);
        },
        error: () => {
          this.tvDetailError.set('Failed to load show details.');
          this.tvDetailLoading.set(false);
        },
      });
  }

  fetchTvWatchProviders(tmdbId: number): void {
    this.tvWatchProviders.set(null);
    this.tvWatchProvidersLoading.set(true);
    this.core.http
      .get<TmdbWatchProviderResponse>(`${this.core.base}/tv/${tmdbId}/watch/providers`, {
        params: this.core.params(),
      })
      .subscribe({
        next: (res) => {
          this.tvWatchProviders.set(res.results[this.core.watchCountry] ?? null);
          this.tvWatchProvidersLoading.set(false);
        },
        error: () => {
          this.tvWatchProviders.set(null);
          this.tvWatchProvidersLoading.set(false);
        },
      });
  }

  private mapTv(r: TmdbTvResult): TmdbMovie {
    return {
      tmdbId: r.id,
      title: r.name,
      year: r.first_air_date ? r.first_air_date.substring(0, 4) : '',
      poster: this.core.imageUrl(r.poster_path, 'w342'),
      backdrop: this.core.imageUrl(r.backdrop_path, 'w780'),
      rating: r.vote_average.toFixed(1),
      overview: r.overview,
      genres: (r.genre_ids ?? [])
        .map((id) => this.core.tvGenres().get(id))
        .filter((name): name is string => !!name)
        .slice(0, 2),
      mediaType: 'tv',
    };
  }

  private mapTvDetail(r: TmdbTvDetail): TmdbTvDetailMapped {
    const { cast, directors, writers } = this.core.mapCredits(r.credits);
    return {
      tmdbId: r.id,
      title: r.name,
      year: r.first_air_date ? r.first_air_date.substring(0, 4) : '',
      poster: this.core.imageUrl(r.poster_path, 'w342'),
      backdrop: this.core.imageUrl(r.backdrop_path, 'w1280'),
      rating: r.vote_average.toFixed(1),
      overview: r.overview,
      genres: r.genres.map((g) => g.name).join(', '),
      tagline: r.tagline,
      status: r.status,
      language: r.original_language.toUpperCase(),
      seasons: r.number_of_seasons,
      episodes: r.number_of_episodes,
      runtime: r.episode_run_time.length ? `${r.episode_run_time[0]} min / ep` : 'N/A',
      cast,
      directors,
      writers,
    };
  }
}
