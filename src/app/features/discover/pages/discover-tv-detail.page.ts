import { Component, inject, effect, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TmdbTvService } from '../../../core/services/tmdb-tv.service';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { Movie } from '../../../models/movie.model';

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: './discover-tv-detail.page.html',
  styleUrl: './discover-tv-detail.page.scss',
})
export class DiscoverTvDetailPage {
  private route = inject(ActivatedRoute);
  tvService = inject(TmdbTvService);
  watchlistService = inject(WatchlistService);

  private params = toSignal(this.route.paramMap);
  posterError = signal(false);

  providers = computed(() => {
    const wp = this.tvService.tvWatchProviders();
    if (!wp) return null;
    return {
      streaming: (wp.flatrate ?? []).slice(0, 6),
      rent: (wp.rent ?? []).slice(0, 4),
      link: wp.link,
    };
  });

  isInWatchlist = computed(() => {
    const detail = this.tvService.tvDetail();
    if (!detail) return false;
    return this.watchlistService.watchlistIds().has(detail.tmdbId);
  });

  constructor() {
    effect(() => {
      const numId = Number(this.params()?.get('tmdbId'));
      if (!numId || !Number.isFinite(numId)) return;
      this.posterError.set(false);
      this.tvService.fetchTvDetail(numId);
      this.tvService.fetchTvWatchProviders(numId);
    });
  }

  addToWatchlist(): void {
    const detail = this.tvService.tvDetail();
    if (!detail) return;
    const movie: Movie = {
      tmdbId: detail.tmdbId,
      title: detail.title,
      year: detail.year,
      poster: detail.poster,
      type: 'series',
      mediaType: 'tv',
    };
    this.watchlistService.add(movie);
  }
}
