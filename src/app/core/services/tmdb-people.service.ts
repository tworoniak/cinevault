import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { TmdbCoreService } from './tmdb-core.service';
import {
  TmdbMovie,
  TmdbPerson,
  TmdbPersonMovieCreditsResponse,
  TmdbPersonTvCreditsResponse,
  TmdbPersonPopular,
  TmdbPersonPopularResponse,
  TmdbPersonSearchResponse,
  TmdbBornTodayPerson,
} from '../../models/tmdb.model';

interface WikiBirth {
  text: string;
  year: number;
  pages: Array<{ title: string }>;
}

interface WikiBirthsResponse {
  births: WikiBirth[];
}

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
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const currentYear = today.getFullYear();

    // Wikipedia's "On This Day" API returns a curated list of people born today,
    // ordered by notability. We take the top 30, then search TMDB for each by name
    // to get their profile photo and TMDB ID. Far more reliable than sampling
    // TMDB's popularity list, which doesn't index by birthday.
    this.core.http
      .get<WikiBirthsResponse>(
        `https://en.wikipedia.org/api/rest_v1/feed/onthisday/births/${month}/${day}`
      )
      .pipe(
        switchMap((wikiRes) => {
          const births = wikiRes.births.slice(0, 30);
          if (births.length === 0) return of([] as (TmdbBornTodayPerson | null)[]);
          return forkJoin(
            births.map((birth) => {
              const name = birth.pages?.[0]?.title ?? birth.text.split(',')[0].trim();
              return this.core.http
                .get<TmdbPersonSearchResponse>(
                  `${this.core.base}/search/person`,
                  { params: this.core.params({ query: name }) }
                )
                .pipe(
                  map((res): TmdbBornTodayPerson | null => {
                    const match = res.results.find((r) => r.profile_path !== null);
                    if (!match) return null;
                    return {
                      id: match.id,
                      name: match.name,
                      profile_path: match.profile_path,
                      known_for_department: match.known_for_department,
                      known_for: match.known_for,
                      birthday: `${birth.year}-${mm}-${dd}`,
                      age: currentYear - birth.year,
                    };
                  }),
                  catchError(() => of(null))
                );
            })
          );
        })
      )
      .subscribe({
        next: (results) => {
          this.bornToday.set(results.filter((r): r is TmdbBornTodayPerson => r !== null));
          this.bornTodayLoading.set(false);
        },
        error: () => {
          this.bornTodayLoading.set(false);
        },
      });
  }
}
