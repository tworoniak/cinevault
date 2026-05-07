import { Component, input, output, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Movie } from '../../../models/movie.model';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
})
export class MovieCardComponent {
  movie = input.required<Movie>();
  mode = input<'search' | 'watchlist' | 'preview'>('search');
  inWatchlist = input<boolean>(false);

  addToWatchlist = output<Movie>();
  removeFromWatchlist = output<number>();

  posterError = signal(false);

  detailRoute = computed(() => {
    const m = this.movie();
    return m.mediaType === 'tv'
      ? ['/discover', 'tv', String(m.tmdbId)]
      : ['/discover', 'movie', String(m.tmdbId)];
  });

  get hasPoster(): boolean {
    const poster = this.movie().poster;
    return poster !== '' && !this.posterError();
  }

  onAdd() {
    this.addToWatchlist.emit(this.movie());
  }

  onRemove() {
    this.removeFromWatchlist.emit(this.movie().tmdbId);
  }
}
