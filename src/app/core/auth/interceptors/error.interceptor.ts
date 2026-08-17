import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const errorHandler = inject(ErrorHandlerService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle specific status codes
      switch (error.status) {
        case 401:
          handleUnauthorized(authService, router);
          break;
        case 403:
          handleForbidden(router);
          break;
        case 404:
          // Not found, usually handled at component level
          break;
        case 0:
          console.error('Network error or CORS issue:', error);
          break;
      }

      // Log the error
      errorHandler.handleError(error);

      return throwError(() => error);
    })
  );
};

function handleUnauthorized(authService: AuthService, router: Router): void {
  authService.logout();
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: router.url }
  });
}

function handleForbidden(router: Router): void {
  router.navigate(['/403']);
}
