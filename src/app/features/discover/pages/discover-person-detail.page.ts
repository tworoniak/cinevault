import { Component, inject, effect, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { TmdbService } from '../../../core/services/tmdb.service';
import { TmdbCardComponent } from '../../../shared/components/tmdb-card/tmdb-card.component';

@Component({
  selector: 'app-discover-person-detail-page',
  standalone: true,
  imports: [RouterLink, TmdbCardComponent],
  templateUrl: './discover-person-detail.page.html',
  styleUrl: './discover-person-detail.page.scss',
})
export class DiscoverPersonDetailPage {
  tmdbService = inject(TmdbService);
  private route = inject(ActivatedRoute);

  personId = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('personId'))))
  );

  bioExpanded = signal(false);

  constructor() {
    effect(() => {
      const id = this.personId();
      if (id) {
        this.tmdbService.fetchPersonDetail(id);
        this.tmdbService.fetchPersonCredits(id);
      }
    });
  }

  toggleBio(): void {
    this.bioExpanded.update((v) => !v);
  }
}
