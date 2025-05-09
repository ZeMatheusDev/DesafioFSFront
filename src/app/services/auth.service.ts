import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, timer } from 'rxjs';
import { catchError, tap, switchMap, take } from 'rxjs/operators';
import { get, set, del } from 'idb-keyval';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    access_token: string;
    expires_in: number; 
    user: User;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  expiresIn?: number; 
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'authState';
  private authSubj = new BehaviorSubject<AuthState>({ user: null, token: null });
  private refreshTokenTimeout?: number;
  private isInitialized = new BehaviorSubject<boolean>(false);
  
  public auth$ = this.authSubj.asObservable();
  public isInitialized$ = this.isInitialized.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.initializeAuthState();
  }

  private async initializeAuthState(): Promise<void> {
    try {
      const savedState = await get<AuthState>(this.STORAGE_KEY);
      if (savedState?.token) {
        this.authSubj.next(savedState);
        if (savedState.expiresIn) {
          this.scheduleTokenRefresh(savedState.expiresIn);
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      this.isInitialized.next(true);
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('http://localhost:8000/api/login', credentials).pipe(
      tap({
        next: (res) => this.handleAuthentication(res),
        error: (error) => this.handleAuthError(error, 'Login failed')
      }),
      catchError(error => {
        this.logout();
        throw error;
      })
    );
  }

  private handleAuthentication(response: AuthResponse): void {
    if (!response.success) return;
  
    const authState: AuthState = {
      user: response.data.user,
      token: response.data.access_token,
      expiresIn: response.data.expires_in 
    };
  
    this.updateAuthState(authState);
    this.scheduleTokenRefresh(response.data.expires_in);
    this.ngZone.run(() => this.router.navigate(['/']));
  }

  private updateAuthState(state: AuthState): void {
    this.authSubj.next(state);
    set(this.STORAGE_KEY, state).catch(error => 
      console.error('Error saving auth state:', error)
    );
  }

  private scheduleTokenRefresh(expiresIn: number): void {
    const refreshTime = expiresIn * 1000 - 60000;
    
    this.ngZone.runOutsideAngular(() => {
      if (this.refreshTokenTimeout) {
        window.clearTimeout(this.refreshTokenTimeout);
      }

      this.refreshTokenTimeout = window.setTimeout(() => {
        this.refreshToken().pipe(take(1)).subscribe();
      }, refreshTime);
    });
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      'http://localhost:8000/api/refresh',
      {},
      { withCredentials: true }
    ).pipe(
      tap({
        next: (res) => this.handleAuthentication(res),
        error: (error) => this.handleAuthError(error, 'Token refresh failed')
      })
    );
  }

  logout(): void {
    this.authSubj.next({ user: null, token: null });
    del(this.STORAGE_KEY).catch(error => 
      console.error('Error clearing auth state:', error)
    );
    
    if (this.refreshTokenTimeout) {
      window.clearTimeout(this.refreshTokenTimeout);
    }
    
    this.ngZone.run(() => this.router.navigate(['/login']));
  }

  private handleAuthError(error: any, context: string): void {
    console.error(`${context}:`, error);
    this.logout();
  }

  get currentUser(): User | null {
    return this.authSubj.value.user;
  }

  get authToken(): string | null {
    return this.authSubj.value.token;
  }
}