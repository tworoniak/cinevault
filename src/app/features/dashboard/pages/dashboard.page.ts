import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { MovieService } from '../../../core/services/movie.service';
import { MovieCardComponent } from '../../../shared/components/movie-card/movie-card.component';

@Component({
  standalone: true,
  imports: [DatePipe, MovieCardComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  watchlistService = inject(WatchlistService);
  movieService = inject(MovieService);
  private titleService = inject(Title);

  constructor() {
    this.titleService.setTitle('Dashboard — CineVault');
  }
}
