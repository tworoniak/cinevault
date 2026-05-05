import { Component, inject } from '@angular/core';
import { MovieService } from '../../../core/services/movie.service';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { MovieCardComponent } from '../../../shared/components/movie-card/movie-card.component';
import { Movie } from '../../../models/movie.model';

@Component({
  standalone: true,
  imports: [MovieCardComponent],
  templateUrl: './movie-search.page.html',
  styleUrl: './movie-search.page.scss',
})
export class MovieSearchPage {
  movieService = inject(MovieService);
  watchlistService = inject(WatchlistService);

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (value.length > 2) {
      this.movieService.searchMovies(value);
    }
  }

  onAdd(movie: Movie) {
    this.watchlistService.add(movie);
  }
}
