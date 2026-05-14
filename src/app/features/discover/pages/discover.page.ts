import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TmdbMovieService } from '../../../core/services/tmdb-movie.service';
import { TmdbTvService } from '../../../core/services/tmdb-tv.service';
import { TmdbCardComponent } from '../../../shared/components/tmdb-card/tmdb-card.component';

@Component({
  selector: 'app-discover-page',
  standalone: true,
  imports: [TmdbCardComponent],
  templateUrl: './discover.page.html',
  styleUrl: './discover.page.scss',
})
export class DiscoverPage {
  movieService = inject(TmdbMovieService);
  tvService = inject(TmdbTvService);
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
    Array.from(this.movieService.genres().entries())
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
        this.tvService.fetchTvGenres();
        this.tvService.fetchTrendingTv();
        this.tvService.fetchPopularTv();
      }
    });

    this.movieService.fetchGenres();
    this.movieService.fetchTrending();
    this.movieService.fetchPopular();
    this.movieService.fetchTopRated();
    this.movieService.fetchNowPlaying();
    this.movieService.fetchUpcoming();

    effect(() => {
      if (!this.movieService.genres().size) return;
      const genres = this.selectedGenres();
      const sort = this.sortBy();
      if (genres.length || sort !== 'popularity.desc') {
        this.movieService.fetchDiscover({ genreIds: genres, sortBy: sort });
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
    this.movieService.discoverResults.set([]);
  }

  loadMoreTrending = () => this.movieService.loadMoreTrending();
  loadMorePopular = () => this.movieService.loadMorePopular();
  loadMoreTopRated = () => this.movieService.loadMoreTopRated();
  loadMoreNowPlaying = () => this.movieService.loadMoreNowPlaying();
  loadMoreUpcoming = () => this.movieService.loadMoreUpcoming();
  loadMoreDiscover = () => this.movieService.loadMoreDiscover();
  loadMoreTrendingTv = () => this.tvService.loadMoreTrendingTv();
  loadMorePopularTv = () => this.tvService.loadMorePopularTv();
}
