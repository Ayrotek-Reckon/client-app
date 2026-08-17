import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { API_CONFIG } from '../../../core/config/api.config';

export interface CreatePaymentIntentRequest {
  orderReference: string;
  userId: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResponse {
  paymentId: string;
  clientSecret: string;
  status: string;
  amount: number;
  currency: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
  completedAt?: string;
}

export interface StripeConfig {
  publishableKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiEndpoint = `${API_CONFIG.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getStripeConfig(): Observable<StripeConfig> {
    return this.http.get<StripeConfig>(`${this.apiEndpoint}/config`);
  }

  createPaymentIntent(request: CreatePaymentIntentRequest): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(
      `${this.apiEndpoint}/intents`,
      request
    ).pipe(
      tap(response => {
        console.log('PaymentIntent created:', response.paymentId);
        sessionStorage.setItem('current_payment_id', response.paymentId);
      }),
      catchError(error => {
        console.error('Failed to create payment intent:', error);
        return throwError(() => new Error(
          error.error?.message || 'Failed to initialize payment. Please try again.'
        ));
      })
    );
  }

  getPaymentStatus(paymentId: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(
      `${this.apiEndpoint}/${paymentId}`
    ).pipe(
      catchError(error => {
        console.error('Failed to fetch payment status:', error);
        return throwError(() => new Error('Failed to fetch payment status'));
      })
    );
  }
}
