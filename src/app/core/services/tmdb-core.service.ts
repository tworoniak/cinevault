import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  TmdbCastMemberMapped,
  TmdbCredits,
  TmdbGenreListResponse,
} from '../../models/tmdb.model';

@Injectable({ providedIn: 'root' })
export class TmdbCoreService {
  readonly http = inject(HttpClient);
  readonly base = environment.tmdbBaseUrl;
  private readonly imageBase = environment.tmdbImageBase;

  readonly watchCountry = 'CA';

  genres = signal<Map<number, string>>(new Map());
  tvGenres = signal<Map<number, string>>(new Map());

  imageUrl(path: string | null, size: string): string {
    if (!path) return '';
    return `${this.imageBase}/${size}${path}`;
  }

  params(extra: Record<string, string> = {}): HttpParams {
    return new HttpParams({ fromObject: { ...extra } });
  }

  mapCredits(credits: TmdbCredits | undefined): { cast: TmdbCastMemberMapped[]; directors: string; writers: string } {
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

  fetchGenres(): void {
    if (this.genres().size > 0) return;
    this.http
      .get<TmdbGenreListResponse>(`${this.base}/genre/movie/list`, { params: this.params() })
      .subscribe({
        next: (res) => {
          const map = new Map<number, string>();
          res.genres.forEach((g) => map.set(g.id, g.name));
          this.genres.set(map);
        },
        error: () => {},
      });
  }

  fetchTvGenres(): void {
    if (this.tvGenres().size > 0) return;
    this.http
      .get<TmdbGenreListResponse>(`${this.base}/genre/tv/list`, { params: this.params() })
      .subscribe({
        next: (res) => {
          const map = new Map<number, string>();
          res.genres.forEach((g) => map.set(g.id, g.name));
          this.tvGenres.set(map);
        },
        error: () => {},
      });
  }
}
