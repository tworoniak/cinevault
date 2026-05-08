import { Injectable, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { TmdbCoreService } from './tmdb-core.service';
import {
  TmdbMovie,
  TmdbPerson,
  TmdbPersonMovieCreditsResponse,
  TmdbPersonTvCreditsResponse,
  TmdbPersonPopular,
  TmdbPersonPopularResponse,
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
}
