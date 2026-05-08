import { Injectable, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { TmdbCoreService } from './tmdb-core.service';
import {
  TmdbMovie,
  TmdbPerson,
  TmdbPersonMovieCreditsResponse,
  TmdbPersonTvCreditsResponse,
  TmdbPersonPopular,
  TmdbPersonPopularResponse,
  TmdbBornTodayPerson,
} from '../../models/tmdb.model';

@Injectable({ providedIn: 'root' })
export class TmdbPeopleService {
  private core = inject(TmdbCoreService);

  imageUrl(path: string | null, size: string): string {
    return this.core.imageUrl(path, size);
  }

  personDetail = signal<TmdbPerson | null>(null);
  personDetailLoading = signal(false);
  personDetailError = signal<string | null>(null);

  personCredits = signal<TmdbMovie[]>([]);
  personCreditsLoading = signal(false);

  popularPeople = signal<TmdbPersonPopular[]>([]);
  popularPeopleLoading = signal(false);

  bornToday = signal<TmdbBornTodayPerson[]>([]);
  bornTodayLoading = signal(false);

  fetchPersonDetail(personId: number): void {
    this.personDetail.set(null);
    this.personDetailLoading.set(true);
    this.personDetailError.set(null);
    this.core.http
      .get<TmdbPerson>(`${this.core.base}/person/${personId}`, {
        params: this.core.params(),
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
      movies: this.core.http.get<TmdbPersonMovieCreditsResponse>(
        `${this.core.base}/person/${personId}/movie_credits`,
        { params: this.core.params() }
      ),
      tv: this.core.http.get<TmdbPersonTvCreditsResponse>(
        `${this.core.base}/person/${personId}/tv_credits`,
        { params: this.core.params() }
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
            poster: this.core.imageUrl(c.poster, 'w342'),
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

  fetchPopularPeople(): void {
    this.popularPeopleLoading.set(true);
    this.core.http
      .get<TmdbPersonPopularResponse>(`${this.core.base}/person/popular`, {
        params: this.core.params(),
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

  fetchBornToday(): void {
    this.bornTodayLoading.set(true);
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayMD = `${mm}-${dd}`;
    const currentYear = today.getFullYear();

    // Fetch popular (5 pages) + daily trending persons together for a larger pool.
    // Trending persons on a given day often include people trending because it's their birthday.
    forkJoin([
      this.core.http.get<TmdbPersonPopularResponse>(`${this.core.base}/person/popular`, { params: this.core.params({ page: '1' }) }),
      this.core.http.get<TmdbPersonPopularResponse>(`${this.core.base}/person/popular`, { params: this.core.params({ page: '2' }) }),
      this.core.http.get<TmdbPersonPopularResponse>(`${this.core.base}/person/popular`, { params: this.core.params({ page: '3' }) }),
      this.core.http.get<TmdbPersonPopularResponse>(`${this.core.base}/person/popular`, { params: this.core.params({ page: '4' }) }),
      this.core.http.get<TmdbPersonPopularResponse>(`${this.core.base}/person/popular`, { params: this.core.params({ page: '5' }) }),
      this.core.http.get<TmdbPersonPopularResponse>(`${this.core.base}/trending/person/day`, { params: this.core.params({ page: '1' }) }),
      this.core.http.get<TmdbPersonPopularResponse>(`${this.core.base}/trending/person/day`, { params: this.core.params({ page: '2' }) }),
      this.core.http.get<TmdbPersonPopularResponse>(`${this.core.base}/trending/person/day`, { params: this.core.params({ page: '3' }) }),
    ]).pipe(
      switchMap((pages) => {
        const seen = new Set<number>();
        const pool: TmdbPersonPopular[] = [];
        for (const page of pages) {
          for (const p of page.results) {
            if (!seen.has(p.id)) {
              seen.add(p.id);
              pool.push(p);
            }
          }
        }
        const popularMap = new Map<number, TmdbPersonPopular>(pool.map(p => [p.id, p]));
        return forkJoin(
          pool.map(p =>
            this.core.http.get<TmdbPerson>(`${this.core.base}/person/${p.id}`, { params: this.core.params() })
          )
        ).pipe(map(details => ({ details, popularMap })));
      })
    ).subscribe({
      next: ({ details, popularMap }) => {
        const matched = details
          .filter(d => d.birthday && d.birthday.slice(5) === todayMD)
          .map(d => {
            const pop = popularMap.get(d.id)!;
            const birthYear = parseInt(d.birthday!.substring(0, 4), 10);
            return {
              id: d.id,
              name: d.name,
              profile_path: d.profile_path,
              known_for_department: d.known_for_department,
              known_for: pop.known_for,
              birthday: d.birthday!,
              age: currentYear - birthYear,
            };
          });
        this.bornToday.set(matched);
        this.bornTodayLoading.set(false);
      },
      error: () => {
        this.bornTodayLoading.set(false);
      },
    });
  }
}
