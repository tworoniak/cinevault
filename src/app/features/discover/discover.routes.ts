import { Routes } from '@angular/router';

export const DISCOVER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/discover.page').then((m) => m.DiscoverPage),
  },
  {
    path: 'movie/:tmdbId',
    loadComponent: () =>
      import('./pages/discover-detail.page').then((m) => m.DiscoverDetailPage),
  },
  {
    path: 'tv/:tmdbId',
    loadComponent: () =>
      import('./pages/discover-tv-detail.page').then((m) => m.DiscoverTvDetailPage),
  },
  {
    path: 'person/:personId',
    loadComponent: () =>
      import('./pages/discover-person-detail.page').then((m) => m.DiscoverPersonDetailPage),
  },
];
