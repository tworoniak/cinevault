import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin } from 'rxjs';
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
  TmdbTvResult,
  TmdbTvListResponse,
  TmdbCredits,
  TmdbTvDetail,
  TmdbTvDetailMapped,
  TmdbPerson,
  TmdbPersonMovieCreditsResponse,
  TmdbPersonTvCreditsResponse,
  TmdbTrendingAllResult,
  TmdbTrendingAllResponse,
  TmdbPersonPopular,
  TmdbPersonPopularResponse,
} from '../../models/tmdb.model';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private http = inject(HttpClient);
  private base = environment.tmdbBaseUrl;
  private imageBase = environment.tmdbImageBase;

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

  genres = signal<Map<number, string>>(new Map());

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

  readonly watchCountry = 'CA';
  watchProviders = signal<TmdbWatchProviderResult | null>(null);
  watchProvidersLoading = signal(false);

  similar = signal<TmdbMovie[]>([]);
  similarLoading = signal(false);

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

  tvGenres = signal<Map<number, string>>(new Map());

  tvDetail = signal<TmdbTvDetailMapped | null>(null);
  tvDetailLoading = signal(false);
  tvDetailError = signal<string | null>(null);

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

  personDetail = signal<TmdbPerson | null>(null);
  personDetailLoading = signal(false);
  personDetailError = signal<string | null>(null);

  personCredits = signal<TmdbMovie[]>([]);
  personCreditsLoading = signal(false);

  trendingAll = signal<TmdbMovie[]>([]);
  trendingAllLoading = signal(false);

  popularPeople = signal<TmdbPersonPopular[]>([]);
  popularPeopleLoading = signal(false);

  imageUrl(path: string | null, size: string): string {
    if (!path) return '';
    return `${this.imageBase}/${size}${path}`;
  }

  fetchGenres(): void {
    if (this.genres().size > 0) return;
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

  fetchTrending(page = 1): void {
    this.trendingLoading.set(true);
    this.trendingError.set(null);
    this.http
      .get<TmdbMovieListResponse>(`${this.base}/trending/movie/week`, {
        params: this.params({ page: String(page) }),
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
    this.http
      .get<TmdbMovieListResponse>(`${this.base}/movie/popular`, {
        params: this.params({ page: String(page) }),
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

  fetchTopRated(page = 1): void {
    if (this.topRated().length && page === 1) return;
    this.topRatedLoading.set(true);
    this.topRatedError.set(null);
    this.http
      .get<TmdbMovieListResponse>(`${this.base}/movie/top_rated`, {
        params: this.params({ page: String(page) }),
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
    this.http
      .get<TmdbMovieListResponse>(`${this.base}/movie/upcoming`, {
        params: this.params({ page: String(page) }),
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
    this.http
      .get<TmdbMovieListResponse>(`${this.base}/movie/now_playing`, {
        params: this.params({ page: String(page) }),
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

  fetchTvGenres(): void {
    this.http
      .get<TmdbGenreListResponse>(`${this.base}/genre/tv/list`, {
        params: this.params(),
      })
      .subscribe({
        next: (res) => {
          const map = new Map<number, string>();
          res.genres.forEach((g) => map.set(g.id, g.name));
          this.tvGenres.set(map);
        },
        error: () => {},
      });
  }

  fetchTrendingTv(page = 1): void {
    this.trendingTvLoading.set(true);
    this.trendingTvError.set(null);
    this.http
      .get<TmdbTvListResponse>(`${this.base}/trending/tv/week`, {
        params: this.params({ page: String(page) }),
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
    this.http
      .get<TmdbTvListResponse>(`${this.base}/tv/popular`, {
        params: this.params({ page: String(page) }),
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

  fetchTvWatchProviders(tmdbId: number): void {
    this.watchProviders.set(null);
    this.watchProvidersLoading.set(true);
    this.http
      .get<TmdbWatchProviderResponse>(`${this.base}/tv/${tmdbId}/watch/providers`, {
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

  fetchTvDetail(tmdbId: number): void {
    this.tvDetailLoading.set(true);
    this.tvDetailError.set(null);
    this.tvDetail.set(null);
    this.http
      .get<TmdbTvDetail>(`${this.base}/tv/${tmdbId}`, {
        params: this.params({ append_to_response: 'credits' }),
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

    this.http
      .get<TmdbMovieListResponse>(`${this.base}/discover/movie`, {
        params: this.params(extra),
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

  fetchPersonDetail(personId: number): void {
    this.personDetail.set(null);
    this.personDetailLoading.set(true);
    this.personDetailError.set(null);
    this.http
      .get<TmdbPerson>(`${this.base}/person/${personId}`, {
        params: this.params(),
      })
      .subscribe({
        next: (res) => {
          this.personDetail.set(res);
          this.personDetailLoading.set(false);
        },
        error: () => {
          this.personDetailError.set('Failed to load person details.');
          this.personDetailLoading.set(false);
        },
      });
  }

  fetchPersonCredits(personId: number): void {
    this.personCredits.set([]);
    this.personCreditsLoading.set(true);
    forkJoin({
      movies: this.http.get<TmdbPersonMovieCreditsResponse>(
        `${this.base}/person/${personId}/movie_credits`,
        { params: this.params() }
      ),
      tv: this.http.get<TmdbPersonTvCreditsResponse>(
        `${this.base}/person/${personId}/tv_credits`,
        { params: this.params() }
      ),
    }).subscribe({
      next: ({ movies, tv }) => {
        const movieItems = movies.cast.map((c) => ({
          tmdbId: c.id,
          title: c.title,
          year: c.release_date ? c.release_date.substring(0, 4) : '',
          poster: c.poster_path,
          vote_average: c.vote_average,
          mediaType: 'movie' as const,
        }));
        const tvItems = tv.cast.map((c) => ({
          tmdbId: c.id,
          title: c.name,
          year: c.first_air_date ? c.first_air_date.substring(0, 4) : '',
          poster: c.poster_path,
          vote_average: c.vote_average,
          mediaType: 'tv' as const,
        }));
        const seen = new Set<number>();
        const credits = [...movieItems, ...tvItems]
          .filter((c) => c.poster && !seen.has(c.tmdbId) && seen.add(c.tmdbId))
          .sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0))
          .slice(0, 20)
          .map((c) => ({
            tmdbId: c.tmdbId,
            title: c.title,
            year: c.year,
            poster: this.imageUrl(c.poster, 'w342'),
            backdrop: '',
            rating: c.vote_average.toFixed(1),
            overview: '',
            genres: [],
            mediaType: c.mediaType,
          }));
        this.personCredits.set(credits);
        this.personCreditsLoading.set(false);
      },
      error: () => {
        this.personCredits.set([]);
        this.personCreditsLoading.set(false);
      },
    });
  }

  fetchTrendingAll(): void {
    this.trendingAllLoading.set(true);
    this.http
      .get<TmdbTrendingAllResponse>(`${this.base}/trending/all/week`, {
        params: this.params(),
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

  fetchPopularPeople(): void {
    this.popularPeopleLoading.set(true);
    this.http
      .get<TmdbPersonPopularResponse>(`${this.base}/person/popular`, {
        params: this.params(),
      })
      .subscribe({
        next: (res) => {
          this.popularPeople.set(res.results);
          this.popularPeopleLoading.set(false);
        },
        error: () => {
          this.popularPeopleLoading.set(false);
        },
      });
  }

  private params(extra: Record<string, string> = {}): HttpParams {
    return new HttpParams({ fromObject: { ...extra } });
  }

  private mapTrendingAllItem(r: TmdbTrendingAllResult): TmdbMovie {
    if (r.media_type === 'tv') {
      return {
        tmdbId: r.id,
        title: r.name ?? '',
        year: r.first_air_date ? r.first_air_date.substring(0, 4) : '',
        poster: this.imageUrl(r.poster_path, 'w342'),
        backdrop: this.imageUrl(r.backdrop_path, 'w1280'),
        rating: r.vote_average.toFixed(1),
        overview: r.overview,
        genres: (r.genre_ids ?? [])
          .map((id) => this.tvGenres().get(id) ?? this.genres().get(id))
          .filter((name): name is string => !!name)
          .slice(0, 2),
        mediaType: 'tv',
      };
    }
    return {
      tmdbId: r.id,
      title: r.title ?? '',
      year: r.release_date ? r.release_date.substring(0, 4) : '',
      poster: this.imageUrl(r.poster_path, 'w342'),
      backdrop: this.imageUrl(r.backdrop_path, 'w1280'),
      rating: r.vote_average.toFixed(1),
      overview: r.overview,
      genres: (r.genre_ids ?? [])
        .map((id) => this.genres().get(id))
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
      poster: this.imageUrl(r.poster_path, 'w342'),
      backdrop: this.imageUrl(r.backdrop_path, 'w780'),
      rating: r.vote_average.toFixed(1),
      overview: r.overview,
      genres: (r.genre_ids ?? [])
        .map((id) => this.genres().get(id))
        .filter((name): name is string => !!name)
        .slice(0, 2),
      mediaType: 'movie',
    };
  }

  private mapTv(r: TmdbTvResult): TmdbMovie {
    return {
      tmdbId: r.id,
      title: r.name,
      year: r.first_air_date ? r.first_air_date.substring(0, 4) : '',
      poster: this.imageUrl(r.poster_path, 'w342'),
      backdrop: this.imageUrl(r.backdrop_path, 'w780'),
      rating: r.vote_average.toFixed(1),
      overview: r.overview,
      genres: (r.genre_ids ?? [])
        .map((id) => this.tvGenres().get(id))
        .filter((name): name is string => !!name)
        .slice(0, 2),
      mediaType: 'tv',
    };
  }

  private mapCredits(credits: TmdbCredits | undefined): { cast: TmdbCastMemberMapped[]; directors: string; writers: string } {
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

    return { cast, directors, writers };
  }

  private mapTvDetail(r: TmdbTvDetail): TmdbTvDetailMapped {
    const { cast, directors, writers } = this.mapCredits(r.credits);

    return {
      tmdbId: r.id,
      title: r.name,
      year: r.first_air_date ? r.first_air_date.substring(0, 4) : '',
      poster: this.imageUrl(r.poster_path, 'w342'),
      backdrop: this.imageUrl(r.backdrop_path, 'w1280'),
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

  private mapDetail(r: TmdbMovieDetail): TmdbMovieDetailMapped {
    const { cast, directors, writers } = this.mapCredits(r.credits);

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
