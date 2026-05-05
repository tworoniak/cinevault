import { Component, inject, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MovieService } from '../../../core/services/movie.service';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { Movie } from '../../../models/movie.model';

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: './movie-detail.page.html',
  styleUrl: './movie-detail.page.scss',
})
export class MovieDetailPage {
  private route = inject(ActivatedRoute);
  movieService = inject(MovieService);
  watchlistService = inject(WatchlistService);

  private params = toSignal(this.route.paramMap);

  constructor() {
    effect(() => {
      const id = this.params()?.get('id');
      if (id) {
        this.movieService.fetchMovieDetail(id);
      }
    });
  }

  get detail() {
    return this.movieService.movieDetail();
  }

  get isInWatchlist(): boolean {
    const detail = this.detail;
    return detail ? this.watchlistService.watchlistIds().has(detail.imdbID) : false;
  }

  get hasPoster(): boolean {
    const poster = this.detail?.poster;
    return !!poster && poster !== 'N/A';
  }

  addToWatchlist() {
    const detail = this.detail;
    if (!detail) return;
    const movie: Movie = {
      imdbID: detail.imdbID,
      title: detail.title,
      year: detail.year,
      poster: detail.poster,
      type: detail.type,
    };
    this.watchlistService.add(movie);
  }
}
