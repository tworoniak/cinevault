import { Injectable, inject, signal, computed } from '@angular/core';
import { Movie } from '../../models/movie.model';
import { StorageService } from './storage.service';

const WATCHLIST_KEY = 'watchlist';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private storage = inject(StorageService);

  watchlist = signal<Movie[]>(this.storage.get<Movie[]>(WATCHLIST_KEY) ?? []);
  watchlistIds = computed(() => new Set(this.watchlist().map((m) => m.imdbID)));
  stats = computed(() => {
    const list = this.watchlist();
    return {
      total: list.length,
      movies: list.filter((m) => m.type === 'movie').length,
      series: list.filter((m) => m.type === 'series').length,
      other: list.filter((m) => m.type !== 'movie' && m.type !== 'series').length,
    };
  });

  add(movie: Movie) {
    if (this.watchlistIds().has(movie.imdbID)) return;
    this.watchlist.update((list) => [...list, movie]);
    this.storage.set(WATCHLIST_KEY, this.watchlist());
  }

  remove(id: string) {
    this.watchlist.update((list) => list.filter((m) => m.imdbID !== id));
    this.storage.set(WATCHLIST_KEY, this.watchlist());
  }
}
