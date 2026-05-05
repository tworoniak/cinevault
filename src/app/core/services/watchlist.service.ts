import { Injectable, inject, signal } from '@angular/core';
import { Movie } from '../../models/movie.model';
import { StorageService } from './storage.service';

const WATCHLIST_KEY = 'watchlist';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private storage = inject(StorageService);

  watchlist = signal<Movie[]>(this.storage.get<Movie[]>(WATCHLIST_KEY) ?? []);

  add(movie: Movie) {
    this.watchlist.update((list) => [...list, movie]);
    this.storage.set(WATCHLIST_KEY, this.watchlist());
  }

  remove(id: string) {
    this.watchlist.update((list) => list.filter((m) => m.imdbID !== id));
    this.storage.set(WATCHLIST_KEY, this.watchlist());
  }
}
