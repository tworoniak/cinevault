import { Component, inject, effect, computed, signal, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { TmdbMovieService } from '../../../core/services/tmdb-movie.service';
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
  movieService = inject(TmdbMovieService);
  watchlistService = inject(WatchlistService);
  location = inject(Location);
  private titleService = inject(Title);

  private params = toSignal(this.route.paramMap);
  posterError = signal(false);
  backdropError = signal(false);
  showTrailer = signal(false);

  @ViewChild('trailerBackdrop') private trailerBackdropEl?: ElementRef<HTMLDivElement>;

  canAddToWatchlist = computed(() => !!this.movieService.movieDetail());

  providers = computed(() => {
    const wp = this.movieService.watchProviders();
    if (!wp) return null;
    return {
      streaming: (wp.flatrate ?? []).slice(0, 6),
      rent: (wp.rent ?? []).slice(0, 4),
      link: wp.link,
    };
  });

  isInWatchlist = computed(() => {
    const detail = this.movieService.movieDetail();
    if (!detail) return false;
    return this.watchlistService.watchlistIds().has(detail.tmdbId);
  });

  constructor() {
    this.movieService.watchProviders.set(null);
    effect(() => {
      const numId = Number(this.params()?.get('tmdbId'));
      if (!numId || !Number.isFinite(numId)) return;
      this.posterError.set(false);
      this.backdropError.set(false);
      this.showTrailer.set(false);
      this.movieService.fetchMovieDetail(numId);
      this.movieService.fetchVideos(numId);
      this.movieService.fetchWatchProviders(numId);
      this.movieService.fetchSimilar(numId);
    });
    effect(() => {
      const detail = this.movieService.movieDetail();
      if (detail) this.titleService.setTitle(`${detail.title} — CineVault`);
    });
  }

  openTrailer(): void {
    this.showTrailer.set(true);
    setTimeout(() => this.trailerBackdropEl?.nativeElement.focus());
  }

  closeTrailer(): void {
    this.showTrailer.set(false);
  }

  onCastPhotoError(event: Event): void {
    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }

  addToWatchlist() {
    const detail = this.movieService.movieDetail();
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
