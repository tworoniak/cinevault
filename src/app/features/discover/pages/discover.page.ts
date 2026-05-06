import { Component, computed, effect, inject, signal } from '@angular/core';
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
    this.tmdbService.fetchGenres();
    this.tmdbService.fetchTrending();
    this.tmdbService.fetchPopular();

    effect(() => {
      const genres = this.selectedGenres();
      const sort = this.sortBy();
      if (genres.length || sort !== 'popularity.desc') {
        this.tmdbService.fetchDiscover({ genreIds: genres, sortBy: sort });
      }
    });
  }

  toggleGenre(id: number): void {
    this.selectedGenres.update((current) =>
      current.includes(id) ? current.filter((g) => g !== id) : [...current, id]
    );
  }

  clearFilters(): void {
    this.selectedGenres.set([]);
    this.sortBy.set('popularity.desc');
    this.tmdbService.discoverResults.set([]);
  }
}
