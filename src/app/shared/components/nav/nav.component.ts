import { Component, inject, signal, ElementRef } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WatchlistService } from '../../../core/services/watchlist.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  watchlistService = inject(WatchlistService);
  isMenuOpen = signal(false);
  private el = inject(ElementRef);

  constructor() {
    const router = inject(Router);
    router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe(() => this.isMenuOpen.set(false));
  }

  toggleMenu(): void {
    const opening = !this.isMenuOpen();
    this.isMenuOpen.set(opening);
    if (opening) {
      setTimeout(() => {
        const firstLink = this.el.nativeElement.querySelector('#mobile-menu a');
        firstLink?.focus();
      }, 0);
    }
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
    const hamburger = this.el.nativeElement.querySelector('.nav__hamburger');
    hamburger?.focus();
  }
}
