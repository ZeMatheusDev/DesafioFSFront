import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { switchMap, take } from 'rxjs/operators';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return auth.auth$.pipe(
    take(1),
    switchMap(state => {
      if (state.token) {
        const clone = req.clone({
          setHeaders: { Authorization: `Bearer ${state.token}` }
        });
        return next(clone);
      }
      return next(req);
    })
  );
};
