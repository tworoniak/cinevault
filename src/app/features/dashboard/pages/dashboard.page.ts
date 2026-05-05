import { Component, inject } from '@angular/core';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { MovieService } from '../../../core/services/movie.service';
import { MovieCardComponent } from '../../../shared/components/movie-card/movie-card.component';

@Component({
  standalone: true,
  imports: [MovieCardComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  watchlistService = inject(WatchlistService);
  movieService = inject(MovieService);
}
