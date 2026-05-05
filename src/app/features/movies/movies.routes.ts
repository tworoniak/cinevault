import { Routes } from '@angular/router';
import { MovieSearchPage } from './pages/movie-search.page';
import { MovieDetailPage } from './pages/movie-detail.page';

export const MOVIES_ROUTES: Routes = [
  {
    path: '',
    component: MovieSearchPage,
  },
  {
    path: ':id',
    component: MovieDetailPage,
  },
];
