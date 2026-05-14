import { Component, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
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
  private titleService = inject(Title);

  private search$ = new Subject<string>();

  constructor() {
    this.titleService.setTitle('Search — CineVault');
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    ).subscribe((query) => {
      if (!query) {
        this.movieService.clearSearch();
        return;
      }
      if (query.length > 2) {
        this.movieService.searchMovies(query);
      }
    });
  }

  onSearch(event: Event) {
    this.search$.next((event.target as HTMLInputElement).value);
  }

  onAdd(movie: Movie) {
    this.watchlistService.add(movie);
  }
}
