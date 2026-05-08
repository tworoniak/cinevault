import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TmdbMovieService } from '../../../core/services/tmdb-movie.service';
import { TmdbTvService } from '../../../core/services/tmdb-tv.service';
import { TmdbPeopleService } from '../../../core/services/tmdb-people.service';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { EntertainmentNewsService } from '../../../core/services/entertainment-news.service';
import { TmdbCardComponent } from '../../../shared/components/tmdb-card/tmdb-card.component';
import { HorizontalCarouselComponent } from '../../../shared/components/horizontal-carousel/horizontal-carousel.component';
import { Movie } from '../../../models/movie.model';
import { TmdbMovie, TmdbPersonPopular } from '../../../models/tmdb.model';
import { NewsCategory } from '../../../models/news.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe, TmdbCardComponent, HorizontalCarouselComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  movieService = inject(TmdbMovieService);
  tvService = inject(TmdbTvService);
  peopleService = inject(TmdbPeopleService);
  watchlistService = inject(WatchlistService);
  newsService = inject(EntertainmentNewsService);

  readonly newsCategories: { id: NewsCategory; label: string }[] = [
    { id: 'top', label: 'Top News' },
    { id: 'movie', label: 'Movie News' },
    { id: 'tv', label: 'TV News' },
    { id: 'celebrity', label: 'Celebrity News' },
  ];

  heroIndex = signal(0);

  heroes = computed(() => this.movieService.trendingAll().slice(0, 5));
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

  bornTodaySubtitle = computed(() => {
    const today = new Date();
    return `People born on ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
  });

  filteredTrending = computed(() => {
    const tab = this.trendingTab();
    const all = this.movieService.trendingAll();
    if (tab === 'all') return all;
    return all.filter((m) => m.mediaType === tab);
  });

  constructor() {
    this.movieService.fetchGenres();
    this.tvService.fetchTvGenres();
    this.movieService.fetchTrendingAll();
    this.movieService.fetchPopular();
    this.tvService.fetchPopularTv();
    this.movieService.fetchNowPlaying();
    this.movieService.fetchUpcoming();
    this.movieService.fetchTopRated();
    this.peopleService.fetchPopularPeople();
    this.peopleService.fetchBornToday();
    this.newsService.fetchNews('top');
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

  personKnownFor(person: TmdbPersonPopular): string {
    return person.known_for
      .slice(0, 2)
      .map((k) => k.title ?? k.name ?? '')
      .filter(Boolean)
      .join(', ');
  }

  personPhotoUrl(profilePath: string | null): string {
    return this.peopleService.imageUrl(profilePath, 'w185');
  }

  trackByTmdbId(_: number, item: TmdbMovie): number {
    return item.tmdbId;
  }
}
