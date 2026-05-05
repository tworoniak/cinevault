import { Component, inject } from '@angular/core';
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

  remove(movie: Movie) {
    this.watchlistService.remove(movie.imdbID);
  }
}
