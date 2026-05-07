import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TmdbService } from '../../../core/services/tmdb.service';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { TmdbCardComponent } from '../../../shared/components/tmdb-card/tmdb-card.component';
import { HorizontalCarouselComponent } from '../../../shared/components/horizontal-carousel/horizontal-carousel.component';
import { Movie } from '../../../models/movie.model';
import { TmdbMovie } from '../../../models/tmdb.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe, TmdbCardComponent, HorizontalCarouselComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  tmdbService = inject(TmdbService);
  watchlistService = inject(WatchlistService);

  heroIndex = signal(0);

  heroes = computed(() => this.tmdbService.trendingAll().slice(0, 5));
  currentHero = computed(() => this.heroes()[this.heroIndex()] ?? null);

  heroDetailRoute = computed(() => {
    const h = this.currentHero();
    if (!h) return null;
    return h.mediaType === 'tv'
      ? ['/discover', 'tv', String(h.tmdbId)]
      : ['/discover', 'movie', String(h.tmdbId)];
  });

  isHeroInWatchlist = computed(() => {
    const h = this.currentHero();
    return h ? this.watchlistService.watchlistIds().has(h.tmdbId) : false;
  });

  trendingTab = signal<'all' | 'movie' | 'tv'>('all');

  filteredTrending = computed(() => {
    const tab = this.trendingTab();
    const all = this.tmdbService.trendingAll();
    if (tab === 'all') return all;
    return all.filter((m) => m.mediaType === tab);
  });

  constructor() {
    this.tmdbService.fetchGenres();
    this.tmdbService.fetchTvGenres();
    this.tmdbService.fetchTrendingAll();
    this.tmdbService.fetchPopular();
    this.tmdbService.fetchPopularTv();
    this.tmdbService.fetchNowPlaying();
    this.tmdbService.fetchUpcoming();
    this.tmdbService.fetchTopRated();
    this.tmdbService.fetchPopularPeople();
  }

  prevHero(): void {
    const len = this.heroes().length;
    if (!len) return;
    this.heroIndex.update((i) => (i - 1 + len) % len);
  }

  nextHero(): void {
    const len = this.heroes().length;
    if (!len) return;
    this.heroIndex.update((i) => (i + 1) % len);
  }

  setHeroIndex(i: number): void {
    this.heroIndex.set(i);
  }

  addHeroToWatchlist(): void {
    const h = this.currentHero();
    if (!h) return;
    const movie: Movie = {
      tmdbId: h.tmdbId,
      title: h.title,
      year: h.year,
      poster: h.poster,
      type: h.mediaType === 'tv' ? 'series' : 'movie',
      mediaType: h.mediaType,
    };
    this.watchlistService.add(movie);
  }

  personKnownFor(person: ReturnType<typeof this.tmdbService.popularPeople>[number]): string {
    return person.known_for
      .slice(0, 2)
      .map((k) => k.title ?? k.name ?? '')
      .filter(Boolean)
      .join(', ');
  }

  personPhotoUrl(profilePath: string | null): string {
    return this.tmdbService.imageUrl(profilePath, 'w185');
  }

  trackByTmdbId(_: number, item: TmdbMovie): number {
    return item.tmdbId;
  }
}
