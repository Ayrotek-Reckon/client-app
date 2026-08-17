import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { catchError, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { API_CONFIG } from '../../config/api.config';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // Skip adding token to auth endpoints
  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  const token = authService.getAccessToken();

  if (token) {
    req = addTokenToRequest(req, token);
  }

  return next(req).pipe(
    catchError(error => {
      // If unauthorized, try to refresh token
      if (error.status === 401 && token) {
        return authService.refreshToken().pipe(
          switchMap(response => {
            const newToken = response.accessToken;
            const clonedReq = addTokenToRequest(req, newToken);
            return next(clonedReq);
          }),
          catchError(() => {
            authService.logout();
            return throwError(() => error);
          }),
          take(1)
        );
      }

      return throwError(() => error);
    })
  );
};

function addTokenToRequest(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function isAuthEndpoint(url: string): boolean {
  const authEndpoints = [
    API_CONFIG.endpoints.login,
    API_CONFIG.endpoints.register
  ];

  return authEndpoints.some(endpoint => url.includes(endpoint));
}
