import { Component, input, output } from '@angular/core';
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

  addToWatchlist = output<Movie>();
  removeFromWatchlist = output<Movie>();

  get hasPoster(): boolean {
    const poster = this.movie().poster;
    return poster !== 'N/A' && poster !== '';
  }

  onAdd() {
    this.addToWatchlist.emit(this.movie());
  }

  onRemove() {
    this.removeFromWatchlist.emit(this.movie());
  }
}
