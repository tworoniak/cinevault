import { Component, inject, effect, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { TmdbPeopleService } from '../../../core/services/tmdb-people.service';
import { TmdbCardComponent } from '../../../shared/components/tmdb-card/tmdb-card.component';

@Component({
  selector: 'app-discover-person-detail-page',
  standalone: true,
  imports: [TmdbCardComponent],
  templateUrl: './discover-person-detail.page.html',
  styleUrl: './discover-person-detail.page.scss',
})
export class DiscoverPersonDetailPage {
  peopleService = inject(TmdbPeopleService);
  location = inject(Location);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);

  personId = toSignal(
    this.route.paramMap.pipe(
      map((p) => {
        const numId = Number(p.get('personId'));
        return Number.isFinite(numId) && numId > 0 ? numId : null;
      })
    )
  );

  bioExpanded = signal(false);

  constructor() {
    effect(() => {
      const id = this.personId();
      if (!id) return;
      this.peopleService.fetchPersonDetail(id);
      this.peopleService.fetchPersonCredits(id);
    });
    effect(() => {
      const person = this.peopleService.personDetail();
      if (person) this.titleService.setTitle(`${person.name} — CineVault`);
    });
  }

  toggleBio(): void {
    this.bioExpanded.update((v) => !v);
  }
}
