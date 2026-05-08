import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TmdbService } from '../../../core/services/tmdb.service';
import { TmdbCardComponent } from '../../../shared/components/tmdb-card/tmdb-card.component';

@Component({
  selector: 'app-discover-page',
  standalone: true,
  imports: [TmdbCardComponent],
  templateUrl: './discover.page.html',
  styleUrl: './discover.page.scss',
})
export class DiscoverPage {
  tmdbService = inject(TmdbService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  activeTab = signal<'movie' | 'tv'>('movie');
  private tvDataFetched = false;

  selectedGenres = signal<number[]>([]);
  sortBy = signal('popularity.desc');

  hasFilters = computed(
    () => this.selectedGenres().length > 0 || this.sortBy() !== 'popularity.desc'
  );

  genreList = computed(() =>
    Array.from(this.tmdbService.genres().entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  );

  readonly sortOptions = [
    { value: 'popularity.desc',            label: 'Most Popular' },
    { value: 'vote_average.desc',          label: 'Highest Rated' },
    { value: 'primary_release_date.desc',  label: 'Newest First' },
    { value: 'revenue.desc',               label: 'Highest Grossing' },
  ];

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((p) => {
      const tab = p['type'] === 'tv' ? 'tv' : 'movie';
      this.activeTab.set(tab);
      if (tab === 'tv' && !this.tvDataFetched) {
        this.tvDataFetched = true;
        this.tmdbService.fetchTvGenres();
        this.tmdbService.fetchTrendingTv();
        this.tmdbService.fetchPopularTv();
      }
    });

    this.tmdbService.fetchGenres();
    this.tmdbService.fetchTrending();
    this.tmdbService.fetchPopular();
    this.tmdbService.fetchTopRated();
    this.tmdbService.fetchNowPlaying();
    this.tmdbService.fetchUpcoming();

    effect(() => {
      const genres = this.selectedGenres();
      const sort = this.sortBy();
      if (genres.length || sort !== 'popularity.desc') {
        this.tmdbService.fetchDiscover({ genreIds: genres, sortBy: sort });
      }
    });
  }

  setTab(tab: 'movie' | 'tv'): void {
    this.router.navigate([], { queryParams: { type: tab }, queryParamsHandling: 'merge' });
  }

  toggleGenre(id: number): void {
    this.selectedGenres.update((current) =>
      current.includes(id) ? current.filter((g) => g !== id) : [...current, id]
    );
  }

  onSortChange(event: Event): void {
    this.sortBy.set((event.target as HTMLSelectElement).value);
  }

  clearFilters(): void {
    this.selectedGenres.set([]);
    this.sortBy.set('popularity.desc');
    this.tmdbService.discoverResults.set([]);
  }

  loadMoreTrending = () => this.tmdbService.loadMoreTrending();
  loadMorePopular = () => this.tmdbService.loadMorePopular();
  loadMoreTopRated = () => this.tmdbService.loadMoreTopRated();
  loadMoreNowPlaying = () => this.tmdbService.loadMoreNowPlaying();
  loadMoreUpcoming = () => this.tmdbService.loadMoreUpcoming();
  loadMoreDiscover = () => this.tmdbService.loadMoreDiscover();
  loadMoreTrendingTv = () => this.tmdbService.loadMoreTrendingTv();
  loadMorePopularTv = () => this.tmdbService.loadMorePopularTv();
}
