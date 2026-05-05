import { Component, inject, effect, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TmdbService } from '../../../core/services/tmdb.service';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { Movie } from '../../../models/movie.model';

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: './discover-detail.page.html',
  styleUrl: './discover-detail.page.scss',
})
export class DiscoverDetailPage {
  private route = inject(ActivatedRoute);
  tmdbService = inject(TmdbService);
  watchlistService = inject(WatchlistService);

  private params = toSignal(this.route.paramMap);

  canAddToWatchlist = computed(() => {
    const detail = this.tmdbService.movieDetail();
    return !!detail?.imdbId;
  });

  isInWatchlist = computed(() => {
    const detail = this.tmdbService.movieDetail();
    if (!detail?.imdbId) return false;
    return this.watchlistService.watchlistIds().has(detail.imdbId);
  });

  constructor() {
    effect(() => {
      const id = this.params()?.get('tmdbId');
      if (id) {
        this.tmdbService.fetchMovieDetail(Number(id));
      }
    });
  }

  addToWatchlist() {
    const detail = this.tmdbService.movieDetail();
    if (!detail?.imdbId) return;
    const movie: Movie = {
      imdbID: detail.imdbId,
      title: detail.title,
      year: detail.year,
      poster: detail.poster,
      type: 'movie',
      source: 'tmdb',
    };
    this.watchlistService.add(movie);
  }
}
