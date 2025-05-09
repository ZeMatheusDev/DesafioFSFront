import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, filter, map, switchMap, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GuestGuard{
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.isInitialized$.pipe(
      filter(initialized => initialized),
      take(1),
      switchMap(() => this.auth.auth$),
      take(1),
      map(state => {
        if (state.token) {
          return this.router.parseUrl('/dashboard');
        }
        return true;
      })
    );
  }
}