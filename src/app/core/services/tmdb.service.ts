import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  TmdbMovie,
  TmdbMovieDetailMapped,
  TmdbCastMemberMapped,
  TmdbMovieListResponse,
  TmdbMovieResult,
  TmdbMovieDetail,
  TmdbGenreListResponse,
  TmdbVideoListResponse,
  TmdbWatchProviderResponse,
  TmdbWatchProviderResult,
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

  trailerKey = signal<string | null>(null);
  trailerLoading = signal(false);

  discoverResults = signal<TmdbMovie[]>([]);
  discoverLoading = signal(false);
  discoverError = signal<string | null>(null);

  readonly watchCountry = 'CA';
  watchProviders = signal<TmdbWatchProviderResult | null>(null);
  watchProvidersLoading = signal(false);

  similar = signal<TmdbMovie[]>([]);
  similarLoading = signal(false);

  topRated = signal<TmdbMovie[]>([]);
  topRatedLoading = signal(false);
  topRatedError = signal<string | null>(null);

  upcoming = signal<TmdbMovie[]>([]);
  upcomingLoading = signal(false);
  upcomingError = signal<string | null>(null);

  nowPlaying = signal<TmdbMovie[]>([]);
  nowPlayingLoading = signal(false);
  nowPlayingError = signal<string | null>(null);

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
        params: this.params({ append_to_response: 'credits' }),
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

  fetchVideos(tmdbId: number): void {
    this.trailerKey.set(null);
    this.trailerLoading.set(true);
    this.http
      .get<TmdbVideoListResponse>(`${this.base}/movie/${tmdbId}/videos`, {
        params: this.params(),
      })
      .subscribe({
        next: (res) => {
          const trailer =
            res.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ??
            res.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
            null;
          this.trailerKey.set(trailer?.key ?? null);
          this.trailerLoading.set(false);
        },
        error: () => {
          this.trailerKey.set(null);
          this.trailerLoading.set(false);
        },
      });
  }

  fetchWatchProviders(tmdbId: number): void {
    this.watchProviders.set(null);
    this.watchProvidersLoading.set(true);
    this.http
      .get<TmdbWatchProviderResponse>(`${this.base}/movie/${tmdbId}/watch/providers`, {
        params: this.params(),
      })
      .subscribe({
        next: (res) => {
          this.watchProviders.set(res.results[this.watchCountry] ?? null);
          this.watchProvidersLoading.set(false);
        },
        error: () => {
          this.watchProviders.set(null);
          this.watchProvidersLoading.set(false);
        },
      });
  }

  fetchSimilar(tmdbId: number): void {
    this.similar.set([]);
    this.similarLoading.set(true);
    this.http
      .get<TmdbMovieListResponse>(`${this.base}/movie/${tmdbId}/recommendations`, {
        params: this.params({ page: '1' }),
      })
      .subscribe({
        next: (res) => {
          this.similar.set(res.results.slice(0, 8).map((r) => this.mapMovie(r)));
          this.similarLoading.set(false);
        },
        error: () => {
          this.similar.set([]);
          this.similarLoading.set(false);
        },
      });
  }

  fetchTopRated(): void {
    this.topRatedLoading.set(true);
    this.topRatedError.set(null);
    this.http
      .get<TmdbMovieListResponse>(`${this.base}/movie/top_rated`, {
        params: this.params({ page: '1' }),
      })
      .subscribe({
        next: (res) => {
          this.topRated.set(res.results.map((r) => this.mapMovie(r)));
          this.topRatedLoading.set(false);
        },
        error: () => {
          this.topRatedError.set('Failed to load top rated movies.');
          this.topRatedLoading.set(false);
        },
      });
  }

  fetchUpcoming(): void {
    this.upcomingLoading.set(true);
    this.upcomingError.set(null);
    this.http
      .get<TmdbMovieListResponse>(`${this.base}/movie/upcoming`, {
        params: this.params({ page: '1' }),
      })
      .subscribe({
        next: (res) => {
          this.upcoming.set(res.results.map((r) => this.mapMovie(r)));
          this.upcomingLoading.set(false);
        },
        error: () => {
          this.upcomingError.set('Failed to load upcoming movies.');
          this.upcomingLoading.set(false);
        },
      });
  }

  fetchNowPlaying(): void {
    this.nowPlayingLoading.set(true);
    this.nowPlayingError.set(null);
    this.http
      .get<TmdbMovieListResponse>(`${this.base}/movie/now_playing`, {
        params: this.params({ page: '1' }),
      })
      .subscribe({
        next: (res) => {
          this.nowPlaying.set(res.results.map((r) => this.mapMovie(r)));
          this.nowPlayingLoading.set(false);
        },
        error: () => {
          this.nowPlayingError.set('Failed to load now playing movies.');
          this.nowPlayingLoading.set(false);
        },
      });
  }

  fetchDiscover(params: { genreIds?: number[]; sortBy?: string }): void {
    this.discoverLoading.set(true);
    this.discoverError.set(null);

    const extra: Record<string, string> = {
      sort_by: params.sortBy ?? 'popularity.desc',
      page: '1',
    };
    if (params.genreIds?.length) {
      extra['with_genres'] = params.genreIds.join(',');
    }

    this.http
      .get<TmdbMovieListResponse>(`${this.base}/discover/movie`, {
        params: this.params(extra),
      })
      .subscribe({
        next: (res) => {
          this.discoverResults.set(res.results.map((r) => this.mapMovie(r)));
          this.discoverLoading.set(false);
        },
        error: () => {
          this.discoverError.set('Failed to load results.');
          this.discoverLoading.set(false);
        },
      });
  }

  private params(extra: Record<string, string> = {}): HttpParams {
    return new HttpParams({ fromObject: { api_key: this.apiKey, ...extra } });
  }

  private mapMovie(r: TmdbMovieResult): TmdbMovie {
    return {
      tmdbId: r.id,
      title: r.title,
      year: r.release_date ? r.release_date.substring(0, 4) : '',
      releaseDate: r.release_date || undefined,
      poster: this.imageUrl(r.poster_path, 'w342'),
      backdrop: this.imageUrl(r.backdrop_path, 'w780'),
      rating: r.vote_average.toFixed(1),
      overview: r.overview,
      genres: (r.genre_ids ?? [])
        .map((id) => this.genres().get(id))
        .filter((name): name is string => !!name)
        .slice(0, 2),
    };
  }

  private mapDetail(r: TmdbMovieDetail): TmdbMovieDetailMapped {
    const credits = r.credits;

    const cast: TmdbCastMemberMapped[] = (credits?.cast ?? [])
      .sort((a, b) => a.order - b.order)
      .slice(0, 8)
      .map((c) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        photo: this.imageUrl(c.profile_path, 'w185'),
      }));

    const directors = (credits?.crew ?? [])
      .filter((c) => c.job === 'Director')
      .map((c) => c.name)
      .join(', ');

    const writers = (credits?.crew ?? [])
      .filter((c) => c.job === 'Screenplay' || c.job === 'Writer' || c.job === 'Story')
      .map((c) => c.name)
      .filter((name, i, arr) => arr.indexOf(name) === i)
      .join(', ');

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
      cast,
      directors,
      writers,
    };
  }
}
