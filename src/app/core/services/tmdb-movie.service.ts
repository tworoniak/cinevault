import { Injectable, inject, signal } from '@angular/core';
import { TmdbCoreService } from './tmdb-core.service';
import {
  TmdbMovie,
  TmdbMovieDetailMapped,
  TmdbMovieListResponse,
  TmdbMovieResult,
  TmdbMovieDetail,
  TmdbVideoListResponse,
  TmdbWatchProviderResponse,
  TmdbWatchProviderResult,
  TmdbTrendingAllResult,
  TmdbTrendingAllResponse,
} from '../../models/tmdb.model';

@Injectable({ providedIn: 'root' })
export class TmdbMovieService {
  private core = inject(TmdbCoreService);

  get genres() { return this.core.genres; }
  get tvGenres() { return this.core.tvGenres; }
  get watchCountry() { return this.core.watchCountry; }

  fetchGenres(): void { this.core.fetchGenres(); }

  imageUrl(path: string | null, size: string): string {
    return this.core.imageUrl(path, size);
  }

  trending = signal<TmdbMovie[]>([]);
  trendingLoading = signal(false);
  trendingError = signal<string | null>(null);
  trendingPage = signal(1);
  trendingTotalPages = signal(1);

  popular = signal<TmdbMovie[]>([]);
  popularLoading = signal(false);
  popularError = signal<string | null>(null);
  popularPage = signal(1);
  popularTotalPages = signal(1);

  movieDetail = signal<TmdbMovieDetailMapped | null>(null);
  detailLoading = signal(false);
  detailError = signal<string | null>(null);

  trailerKey = signal<string | null>(null);
  trailerLoading = signal(false);

  discoverResults = signal<TmdbMovie[]>([]);
  discoverLoading = signal(false);
  discoverError = signal<string | null>(null);
  discoverPage = signal(1);
  discoverTotalPages = signal(1);
  private lastDiscoverParams: { genreIds?: number[]; sortBy?: string } = {};

  watchProviders = signal<TmdbWatchProviderResult | null>(null);
  watchProvidersLoading = signal(false);

  similar = signal<TmdbMovie[]>([]);
  similarLoading = signal(false);

  topRated = signal<TmdbMovie[]>([]);
  topRatedLoading = signal(false);
  topRatedError = signal<string | null>(null);
  topRatedPage = signal(1);
  topRatedTotalPages = signal(1);

  upcoming = signal<TmdbMovie[]>([]);
  upcomingLoading = signal(false);
  upcomingError = signal<string | null>(null);
  upcomingPage = signal(1);
  upcomingTotalPages = signal(1);

  nowPlaying = signal<TmdbMovie[]>([]);
  nowPlayingLoading = signal(false);
  nowPlayingError = signal<string | null>(null);
  nowPlayingPage = signal(1);
  nowPlayingTotalPages = signal(1);

  trendingAll = signal<TmdbMovie[]>([]);
  trendingAllLoading = signal(false);

  private detailRequestId = 0;
  private videosRequestId = 0;
  private watchProvidersRequestId = 0;
  private similarRequestId = 0;

  fetchTrending(page = 1): void {
    this.trendingLoading.set(true);
    this.trendingError.set(null);
    this.core.http
      .get<TmdbMovieListResponse>(`${this.core.base}/trending/movie/week`, {
        params: this.core.params({ page: String(page) }),
      })
      .subscribe({
        next: (res) => {
          const mapped = res.results.map((r) => this.mapMovie(r));
          this.trending.update((prev) => (page === 1 ? mapped : [...prev, ...mapped]));
          this.trendingPage.set(page);
          this.trendingTotalPages.set(res.total_pages);
          this.trendingLoading.set(false);
        },
        error: () => {
          this.trendingError.set('Failed to load trending movies.');
          this.trendingLoading.set(false);
        },
      });
  }

  loadMoreTrending(): void {
    const next = this.trendingPage() + 1;
    if (next <= this.trendingTotalPages()) this.fetchTrending(next);
  }

  fetchPopular(page = 1): void {
    if (this.popular().length && page === 1) return;
    this.popularLoading.set(true);
    this.popularError.set(null);
    this.core.http
      .get<TmdbMovieListResponse>(`${this.core.base}/movie/popular`, {
        params: this.core.params({ page: String(page) }),
      })
      .subscribe({
        next: (res) => {
          const mapped = res.results.map((r) => this.mapMovie(r));
          this.popular.update((prev) => (page === 1 ? mapped : [...prev, ...mapped]));
          this.popularPage.set(page);
          this.popularTotalPages.set(res.total_pages);
          this.popularLoading.set(false);
        },
        error: () => {
          this.popularError.set('Failed to load popular movies.');
          this.popularLoading.set(false);
        },
      });
  }

  loadMorePopular(): void {
    const next = this.popularPage() + 1;
    if (next <= this.popularTotalPages()) this.fetchPopular(next);
  }

  fetchMovieDetail(tmdbId: number): void {
    const requestId = ++this.detailRequestId;
    this.detailLoading.set(true);
    this.detailError.set(null);
    this.movieDetail.set(null);
    this.core.http
      .get<TmdbMovieDetail>(`${this.core.base}/movie/${tmdbId}`, {
        params: this.core.params({ append_to_response: 'credits' }),
      })
      .subscribe({
        next: (res) => {
          if (requestId !== this.detailRequestId) return;
          this.movieDetail.set(this.mapDetail(res));
          this.detailLoading.set(false);
        },
        error: () => {
          if (requestId !== this.detailRequestId) return;
          this.detailError.set('Failed to load movie details.');
          this.detailLoading.set(false);
        },
      });
  }

  fetchVideos(tmdbId: number): void {
    const requestId = ++this.videosRequestId;
    this.trailerKey.set(null);
    this.trailerLoading.set(true);
    this.core.http
      .get<TmdbVideoListResponse>(`${this.core.base}/movie/${tmdbId}/videos`, {
        params: this.core.params(),
      })
      .subscribe({
        next: (res) => {
          if (requestId !== this.videosRequestId) return;
          const YOUTUBE_KEY_RE = /^[A-Za-z0-9_-]{6,20}$/;
          const trailer =
            res.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ??
            res.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
            null;
          const key = trailer?.key ?? null;
          this.trailerKey.set(key && YOUTUBE_KEY_RE.test(key) ? key : null);
          this.trailerLoading.set(false);
        },
        error: () => {
          if (requestId !== this.videosRequestId) return;
          this.trailerKey.set(null);
          this.trailerLoading.set(false);
        },
      });
  }

  fetchWatchProviders(tmdbId: number): void {
    const requestId = ++this.watchProvidersRequestId;
    this.watchProviders.set(null);
    this.watchProvidersLoading.set(true);
    this.core.http
      .get<TmdbWatchProviderResponse>(`${this.core.base}/movie/${tmdbId}/watch/providers`, {
        params: this.core.params(),
      })
      .subscribe({
        next: (res) => {
          if (requestId !== this.watchProvidersRequestId) return;
          this.watchProviders.set(res.results[this.watchCountry] ?? null);
          this.watchProvidersLoading.set(false);
        },
        error: () => {
          if (requestId !== this.watchProvidersRequestId) return;
          this.watchProviders.set(null);
          this.watchProvidersLoading.set(false);
        },
      });
  }

  fetchSimilar(tmdbId: number): void {
    const requestId = ++this.similarRequestId;
    this.similar.set([]);
    this.similarLoading.set(true);
    this.core.http
      .get<TmdbMovieListResponse>(`${this.core.base}/movie/${tmdbId}/recommendations`, {
        params: this.core.params({ page: '1' }),
      })
      .subscribe({
        next: (res) => {
          if (requestId !== this.similarRequestId) return;
          this.similar.set(res.results.slice(0, 8).map((r) => this.mapMovie(r)));
          this.similarLoading.set(false);
        },
        error: () => {
          if (requestId !== this.similarRequestId) return;
          this.similar.set([]);
          this.similarLoading.set(false);
        },
      });
  }

  fetchTopRated(page = 1): void {
    if (this.topRated().length && page === 1) return;
    this.topRatedLoading.set(true);
    this.topRatedError.set(null);
    this.core.http
      .get<TmdbMovieListResponse>(`${this.core.base}/movie/top_rated`, {
        params: this.core.params({ page: String(page) }),
      })
      .subscribe({
        next: (res) => {
          const mapped = res.results.map((r) => this.mapMovie(r));
          this.topRated.update((prev) => (page === 1 ? mapped : [...prev, ...mapped]));
          this.topRatedPage.set(page);
          this.topRatedTotalPages.set(res.total_pages);
          this.topRatedLoading.set(false);
        },
        error: () => {
          this.topRatedError.set('Failed to load top rated movies.');
          this.topRatedLoading.set(false);
        },
      });
  }

  loadMoreTopRated(): void {
    const next = this.topRatedPage() + 1;
    if (next <= this.topRatedTotalPages()) this.fetchTopRated(next);
  }

  fetchUpcoming(page = 1): void {
    if (this.upcoming().length && page === 1) return;
    this.upcomingLoading.set(true);
    this.upcomingError.set(null);
    this.core.http
      .get<TmdbMovieListResponse>(`${this.core.base}/movie/upcoming`, {
        params: this.core.params({ page: String(page) }),
      })
      .subscribe({
        next: (res) => {
          const mapped = res.results.map((r) => this.mapMovie(r));
          this.upcoming.update((prev) => (page === 1 ? mapped : [...prev, ...mapped]));
          this.upcomingPage.set(page);
          this.upcomingTotalPages.set(res.total_pages);
          this.upcomingLoading.set(false);
        },
        error: () => {
          this.upcomingError.set('Failed to load upcoming movies.');
          this.upcomingLoading.set(false);
        },
      });
  }

  loadMoreUpcoming(): void {
    const next = this.upcomingPage() + 1;
    if (next <= this.upcomingTotalPages()) this.fetchUpcoming(next);
  }

  fetchNowPlaying(page = 1): void {
    if (this.nowPlaying().length && page === 1) return;
    this.nowPlayingLoading.set(true);
    this.nowPlayingError.set(null);
    this.core.http
      .get<TmdbMovieListResponse>(`${this.core.base}/movie/now_playing`, {
        params: this.core.params({ page: String(page) }),
      })
      .subscribe({
        next: (res) => {
          const mapped = res.results.map((r) => this.mapMovie(r));
          this.nowPlaying.update((prev) => (page === 1 ? mapped : [...prev, ...mapped]));
          this.nowPlayingPage.set(page);
          this.nowPlayingTotalPages.set(res.total_pages);
          this.nowPlayingLoading.set(false);
        },
        error: () => {
          this.nowPlayingError.set('Failed to load now playing movies.');
          this.nowPlayingLoading.set(false);
        },
      });
  }

  loadMoreNowPlaying(): void {
    const next = this.nowPlayingPage() + 1;
    if (next <= this.nowPlayingTotalPages()) this.fetchNowPlaying(next);
  }

  fetchDiscover(params: { genreIds?: number[]; sortBy?: string }, page = 1): void {
    this.discoverLoading.set(true);
    this.discoverError.set(null);
    if (page === 1) this.lastDiscoverParams = params;

    const extra: Record<string, string> = {
      sort_by: params.sortBy ?? 'popularity.desc',
      page: String(page),
    };
    if (params.genreIds?.length) {
      extra['with_genres'] = params.genreIds.join(',');
    }

    this.core.http
      .get<TmdbMovieListResponse>(`${this.core.base}/discover/movie`, {
        params: this.core.params(extra),
      })
      .subscribe({
        next: (res) => {
          const mapped = res.results.map((r) => this.mapMovie(r));
          this.discoverResults.update((prev) => (page === 1 ? mapped : [...prev, ...mapped]));
          this.discoverPage.set(page);
          this.discoverTotalPages.set(res.total_pages);
          this.discoverLoading.set(false);
        },
        error: () => {
          this.discoverError.set('Failed to load results.');
          this.discoverLoading.set(false);
        },
      });
  }

  loadMoreDiscover(): void {
    const next = this.discoverPage() + 1;
    if (next <= this.discoverTotalPages()) this.fetchDiscover(this.lastDiscoverParams, next);
  }

  fetchTrendingAll(): void {
    this.trendingAllLoading.set(true);
    this.core.http
      .get<TmdbTrendingAllResponse>(`${this.core.base}/trending/all/week`, {
        params: this.core.params(),
      })
      .subscribe({
        next: (res) => {
          const mapped = res.results
            .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
            .map((r) => this.mapTrendingAllItem(r));
          this.trendingAll.set(mapped);
          this.trendingAllLoading.set(false);
        },
        error: () => {
          this.trendingAllLoading.set(false);
        },
      });
  }

  private mapTrendingAllItem(r: TmdbTrendingAllResult): TmdbMovie {
    if (r.media_type === 'tv') {
      return {
        tmdbId: r.id,
        title: r.name ?? '',
        year: r.first_air_date ? r.first_air_date.substring(0, 4) : '',
        poster: this.core.imageUrl(r.poster_path, 'w342'),
        backdrop: this.core.imageUrl(r.backdrop_path, 'w1280'),
        rating: r.vote_average.toFixed(1),
        overview: r.overview,
        genres: (r.genre_ids ?? [])
          .map((id) => this.core.tvGenres().get(id) ?? this.core.genres().get(id))
          .filter((name): name is string => !!name)
          .slice(0, 2),
        mediaType: 'tv',
      };
    }
    return {
      tmdbId: r.id,
      title: r.title ?? '',
      year: r.release_date ? r.release_date.substring(0, 4) : '',
      poster: this.core.imageUrl(r.poster_path, 'w342'),
      backdrop: this.core.imageUrl(r.backdrop_path, 'w1280'),
      rating: r.vote_average.toFixed(1),
      overview: r.overview,
      genres: (r.genre_ids ?? [])
        .map((id) => this.core.genres().get(id))
        .filter((name): name is string => !!name)
        .slice(0, 2),
      mediaType: 'movie',
    };
  }

  private mapMovie(r: TmdbMovieResult): TmdbMovie {
    return {
      tmdbId: r.id,
      title: r.title,
      year: r.release_date ? r.release_date.substring(0, 4) : '',
      releaseDate: r.release_date || undefined,
      poster: this.core.imageUrl(r.poster_path, 'w342'),
      backdrop: this.core.imageUrl(r.backdrop_path, 'w780'),
      rating: r.vote_average.toFixed(1),
      overview: r.overview,
      genres: (r.genre_ids ?? [])
        .map((id) => this.core.genres().get(id))
        .filter((name): name is string => !!name)
        .slice(0, 2),
      mediaType: 'movie',
    };
  }

  private mapDetail(r: TmdbMovieDetail): TmdbMovieDetailMapped {
    const { cast, directors, writers } = this.core.mapCredits(r.credits);
    return {
      tmdbId: r.id,
      imdbId: r.imdb_id,
      title: r.title,
      year: r.release_date ? r.release_date.substring(0, 4) : '',
      poster: this.core.imageUrl(r.poster_path, 'w342'),
      backdrop: this.core.imageUrl(r.backdrop_path, 'w1280'),
      rating: r.vote_average.toFixed(1),
      overview: r.overview,
      genres: r.genres.map((g) => g.name).join(', '),
      runtime: r.runtime ? `${r.runtime} min` : 'N/A',
      tagline: r.tagline,
      status: r.status,
      language: r.original_language.toUpperCase(),
      cast,
      directors,
      writers,
    };
  }
}
