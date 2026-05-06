import { Routes } from '@angular/router';
import { MovieSearchPage } from './pages/movie-search.page';

export const MOVIES_ROUTES: Routes = [
  {
    path: '',
    component: MovieSearchPage,
  },
];
