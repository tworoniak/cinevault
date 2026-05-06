import { Component, inject, effect, computed, signal, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TmdbService } from '../../../core/services/tmdb.service';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { Movie } from '../../../models/movie.model';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';

@Component({
  standalone: true,
  imports: [RouterLink, SafeUrlPipe],
  templateUrl: './discover-detail.page.html',
  styleUrl: './discover-detail.page.scss',
})
export class DiscoverDetailPage {
  private route = inject(ActivatedRoute);
  tmdbService = inject(TmdbService);
  watchlistService = inject(WatchlistService);

  private params = toSignal(this.route.paramMap);
  posterError = signal(false);
  showTrailer = signal(false);

  @ViewChild('trailerBackdrop') private trailerBackdropEl?: ElementRef<HTMLDivElement>;

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
        this.posterError.set(false);
        this.showTrailer.set(false);
        this.tmdbService.fetchMovieDetail(Number(id));
        this.tmdbService.fetchVideos(Number(id));
      }
    });
  }

  openTrailer(): void {
    this.showTrailer.set(true);
    setTimeout(() => this.trailerBackdropEl?.nativeElement.focus());
  }

  closeTrailer(): void {
    this.showTrailer.set(false);
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
