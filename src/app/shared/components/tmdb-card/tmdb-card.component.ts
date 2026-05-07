import { Component, input, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TmdbMovie } from '../../../models/tmdb.model';

@Component({
  selector: 'app-tmdb-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tmdb-card.component.html',
  styleUrl: './tmdb-card.component.scss',
})
export class TmdbCardComponent {
  movie = input.required<TmdbMovie>();
  posterError = signal(false);

  detailRoute = computed(() => {
    const m = this.movie();
    return m.mediaType === 'tv'
      ? ['/discover', 'tv', String(m.tmdbId)]
      : ['/discover', 'movie', String(m.tmdbId)];
  });
}
