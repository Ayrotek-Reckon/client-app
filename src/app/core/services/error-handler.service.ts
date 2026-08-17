import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppError } from '../../shared/models/error.model';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {
  private errorSubject = new BehaviorSubject<AppError | null>(null);
  public error$ = this.errorSubject.asObservable();

  private errorHistorySubject = new BehaviorSubject<AppError[]>([]);
  public errorHistory$ = this.errorHistorySubject.asObservable();

  constructor(private injector: Injector) { }

  handleError(error: Error | HttpErrorResponse): void {
    const appError = this.transformError(error);
    this.errorSubject.next(appError);
    this.addToHistory(appError);
    this.logError(appError);
  }

  private transformError(error: Error | HttpErrorResponse): AppError {
    let appError: AppError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
      timestamp: new Date().toISOString()
    };

    if (error instanceof HttpErrorResponse) {
      appError.statusCode = error.status;
      appError.path = error.url || undefined;

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        appError.code = 'CLIENT_ERROR';
        appError.message = error.error.message;
      } else {
        // Server-side error
        appError.code = this.getErrorCode(error.status);
        appError.message = this.getErrorMessage(error);
        appError.details = error.error;
      }
    } else {
      appError.code = 'APPLICATION_ERROR';
      appError.message = error.message || 'An application error occurred';
    }

    return appError;
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 422:
        return 'VALIDATION_ERROR';
      case 500:
        return 'INTERNAL_SERVER_ERROR';
      case 503:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'HTTP_ERROR';
    }
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    // Try to get message from error response
    if (error.error?.message) {
      return error.error.message;
    }

    // Default messages based on status
    switch (error.status) {
      case 0:
        return 'Network error. Please check your connection.';
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'You are not authenticated. Please log in.';
      case 403:
        return 'You do not have permission to access this resource.';
      case 404:
        return 'The requested resource was not found.';
      case 422:
        return 'Validation failed. Please correct your input.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return error.statusText || 'An error occurred';
    }
  }

  private addToHistory(error: AppError): void {
    const history = this.errorHistorySubject.value;
    history.push(error);

    // Keep only last 50 errors
    if (history.length > 50) {
      history.shift();
    }

    this.errorHistorySubject.next(history);
  }

  private logError(error: AppError): void {
    console.error('[App Error]', error);

    // In production, you would send this to a logging service
    // this.loggingService.logError(error).subscribe();
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  clearHistory(): void {
    this.errorHistorySubject.next([]);
  }

  getLastError(): AppError | null {
    return this.errorSubject.value;
  }

  getErrorHistory(): AppError[] {
    return this.errorHistorySubject.value;
  }
}
