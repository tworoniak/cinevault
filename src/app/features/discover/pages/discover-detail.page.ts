import { Component, inject, effect, computed, signal, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TmdbService } from '../../../core/services/tmdb.service';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { Movie } from '../../../models/movie.model';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';
import { TmdbCardComponent } from '../../../shared/components/tmdb-card/tmdb-card.component';

@Component({
  standalone: true,
  imports: [RouterLink, SafeUrlPipe, TmdbCardComponent],
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

  canAddToWatchlist = computed(() => !!this.tmdbService.movieDetail());

  providers = computed(() => {
    const wp = this.tmdbService.watchProviders();
    if (!wp) return null;
    return {
      streaming: (wp.flatrate ?? []).slice(0, 6),
      rent: (wp.rent ?? []).slice(0, 4),
      link: wp.link,
    };
  });

  isInWatchlist = computed(() => {
    const detail = this.tmdbService.movieDetail();
    if (!detail) return false;
    return this.watchlistService.watchlistIds().has(detail.tmdbId);
  });

  constructor() {
    this.tmdbService.watchProviders.set(null);
    effect(() => {
      const numId = Number(this.params()?.get('tmdbId'));
      if (!numId || !Number.isFinite(numId)) return;
      this.posterError.set(false);
      this.showTrailer.set(false);
      this.tmdbService.fetchMovieDetail(numId);
      this.tmdbService.fetchVideos(numId);
      this.tmdbService.fetchWatchProviders(numId);
      this.tmdbService.fetchSimilar(numId);
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
    if (!detail) return;
    const movie: Movie = {
      tmdbId: detail.tmdbId,
      title: detail.title,
      year: detail.year,
      poster: detail.poster,
      type: 'movie',
    };
    this.watchlistService.add(movie);
  }
}
