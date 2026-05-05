import { Component, inject, computed } from '@angular/core';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { MovieCardComponent } from '../../../shared/components/movie-card/movie-card.component';
import { Movie } from '../../../models/movie.model';

@Component({
  standalone: true,
  imports: [MovieCardComponent],
  templateUrl: './watchlist.page.html',
  styleUrl: './watchlist.page.scss',
})
export class WatchlistPage {
  watchlistService = inject(WatchlistService);

  movies = computed(() => this.watchlistService.watchlist().filter((m) => m.type === 'movie'));
  series = computed(() => this.watchlistService.watchlist().filter((m) => m.type === 'series'));
  other = computed(() =>
    this.watchlistService.watchlist().filter((m) => m.type !== 'movie' && m.type !== 'series')
  );

  remove(movie: Movie) {
    this.watchlistService.remove(movie.imdbID);
  }
}
