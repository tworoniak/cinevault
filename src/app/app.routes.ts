import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/movies/movies.routes').then((m) => m.MOVIES_ROUTES),
  },
  {
    path: 'watchlist',
    loadChildren: () =>
      import('./features/watchlist/watchlist.routes').then((m) => m.WATCHLIST_ROUTES),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
];
