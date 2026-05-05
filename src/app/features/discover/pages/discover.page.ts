import { Component, inject } from '@angular/core';
import { TmdbService } from '../../../core/services/tmdb.service';
import { TmdbCardComponent } from '../../../shared/components/tmdb-card/tmdb-card.component';

@Component({
  selector: 'app-discover-page',
  standalone: true,
  imports: [TmdbCardComponent],
  templateUrl: './discover.page.html',
  styleUrl: './discover.page.scss',
})
export class DiscoverPage {
  tmdbService = inject(TmdbService);

  constructor() {
    this.tmdbService.fetchGenres();
    this.tmdbService.fetchTrending();
    this.tmdbService.fetchPopular();
  }
}
