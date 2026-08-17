import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthResponse, LoginRequest, RegisterRequest, RefreshTokenRequest, User, TokenPayload } from '../models/auth.model';
import { API_CONFIG } from '../../config/api.config';
import jwtDecode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromToken());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private tokenRefreshTimer: any;

  constructor(private http: HttpClient) {
    this.setupTokenRefresh();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_CONFIG.apiUrl}${API_CONFIG.endpoints.login}`, credentials)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_CONFIG.apiUrl}${API_CONFIG.endpoints.register}`, data)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();

    // Best-effort server-side revoke; ignore failures so local logout always succeeds
    if (refreshToken) {
      const body: RefreshTokenRequest = { refreshToken };
      this.http.post<void>(`${API_CONFIG.apiUrl}${API_CONFIG.endpoints.logout}`, body)
        .pipe(catchError(() => throwError(() => null)))
        .subscribe();
    }

    this.clearTokens();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.clearTokenRefreshTimer();
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const body: RefreshTokenRequest = { refreshToken };

    return this.http.post<AuthResponse>(`${API_CONFIG.apiUrl}${API_CONFIG.endpoints.refreshToken}`, body)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(() => {
          this.logout();
          return throwError(() => new Error('Token refresh failed'));
        })
      );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(API_CONFIG.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(API_CONFIG.refreshTokenKey);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(API_CONFIG.tokenKey, response.accessToken);
    localStorage.setItem(API_CONFIG.refreshTokenKey, response.refreshToken);

    const user = this.decodeUserFromToken(response.accessToken);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    this.setupTokenRefresh();
  }

  private getUserFromToken(): User | null {
    const token = this.getAccessToken();
    return token ? this.decodeUserFromToken(token) : null;
  }

  private decodeUserFromToken(token: string): User | null {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return {
        id: decoded.sub,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role
      };
    } catch {
      return null;
    }
  }

  private hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const expirationTime = decoded.exp * 1000;
      return expirationTime > Date.now();
    } catch {
      return false;
    }
  }

  private getTokenExpirationTime(): number {
    const token = this.getAccessToken();
    if (!token) return 0;

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.exp * 1000;
    } catch {
      return 0;
    }
  }

  private setupTokenRefresh(): void {
    this.clearTokenRefreshTimer();
    const expirationTime = this.getTokenExpirationTime();
    const now = Date.now();
    const timeUntilExpiration = expirationTime - now;

    if (timeUntilExpiration > 0) {
      const refreshTime = Math.max(timeUntilExpiration - 60000, 1000);
      this.tokenRefreshTimer = setTimeout(() => {
        this.refreshToken().subscribe({
          error: () => this.logout()
        });
      }, refreshTime);
    }
  }

  private clearTokenRefreshTimer(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }
  }

  private clearTokens(): void {
    localStorage.removeItem(API_CONFIG.tokenKey);
    localStorage.removeItem(API_CONFIG.refreshTokenKey);
    localStorage.removeItem(API_CONFIG.userKey);
  }

  private handleError(error: any): Observable<never> {
    console.error('Auth error:', error);
    return throwError(() => error);
  }
}
