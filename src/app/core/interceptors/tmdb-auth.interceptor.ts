import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const tmdbAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('api.themoviedb.org')) {
    return next(req);
  }

  const authReq = environment.tmdbReadToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${environment.tmdbReadToken}` } })
    : req.clone({ params: req.params.set('api_key', environment.tmdbApiKey) });

  return next(authReq);
};
