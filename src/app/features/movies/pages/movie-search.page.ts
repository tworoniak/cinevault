import { Component, inject } from '@angular/core';
import { MovieService } from '../../../core/services/movie.service';

@Component({
  standalone: true,
  template: `
    <div>
      <input placeholder="Search movies..." (input)="onSearch($event)" />

      @if (movieService.loading()) {
        <p>Loading...</p>
      }

      @if (movieService.error()) {
        <p>{{ movieService.error() }}</p>
      }

      <ul>
        @for (movie of movieService.movies(); track movie.imdbID) {
          <li>{{ movie.title }}</li>
        }
      </ul>
    </div>
  `,
})
export class MovieSearchPage {
  movieService = inject(MovieService);

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (value.length > 2) {
      this.movieService.searchMovies(value);
    }
  }
}
