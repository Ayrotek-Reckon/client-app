import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { EnergyCartService } from '../../../energy/services/energy-cart.service';
import { AuthService } from '../../../../core/auth/services/auth.service';

declare const Stripe: any;

interface PaymentState {
  processing: boolean;
  error: string | null;
  success: boolean;
}

@Component({
  selector: 'app-stripe-card-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stripe-card-payment.component.html',
  styleUrls: ['./stripe-card-payment.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StripeCardPaymentComponent implements OnInit, OnDestroy {
  state = signal<PaymentState>({
    processing: false,
    error: null,
    success: false
  });

  amount = signal<number>(0);
  currency = signal<string>('USD');

  private stripe: any = null;
  private elements: any = null;
  private cardElement: any = null;
  private stripePublishableKey: string = '';

  constructor(
    private paymentService: PaymentService,
    private cart: EnergyCartService,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      if (!(window as any).Stripe) {
        this.updateError('Stripe library not loaded. Please refresh the page.');
        return;
      }

      // Load Stripe publishable key from backend
      const config = await this.paymentService.getStripeConfig().toPromise();
      if (!config?.publishableKey) {
        this.updateError('Failed to load Stripe configuration');
        return;
      }
      this.stripePublishableKey = config.publishableKey;

      this.stripe = (window as any).Stripe(this.stripePublishableKey);

      if (!this.stripe) {
        this.updateError('Failed to initialize Stripe. Please check your API key.');
        return;
      }

      this.elements = this.stripe.elements();
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424242',
            fontFamily: 'Segoe UI, Roboto, sans-serif'
          },
          invalid: {
            color: '#d32f2f'
          }
        }
      });

      const cardElementDiv = document.getElementById('card-element');
      if (cardElementDiv && this.cardElement) {
        this.cardElement.mount(cardElementDiv);

        this.cardElement.addEventListener('change', (event: any) => {
          if (event.error) {
            this.updateError(event.error.message);
          } else {
            this.updateError(null);
          }
        });
      }

      const tier = this.cart.selectedTier();
      if (tier) {
        this.amount.set(tier.price);
        this.currency.set('USD');
      }
    } catch (err) {
      console.error('Failed to initialize Stripe:', err);
      this.updateError('Failed to initialize payment system');
    }
  }

  async confirmPayment(): Promise<void> {
    if (!this.stripe || !this.elements || !this.cardElement) {
      this.updateError('Payment system not initialized');
      return;
    }

    this.state.update(s => ({ ...s, processing: true, error: null }));
    console.log('[PAYMENT] Starting payment confirmation...');

    try {
      const clientSecret = await this.getClientSecret();
      console.log('[PAYMENT] Got clientSecret:', clientSecret?.substring(0, 20) + '...');

      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {}
        }
      });
      console.log('[PAYMENT] Stripe response:', result);

      if (result.error) {
        console.error('[PAYMENT] Stripe error:', result.error.message);
        this.updateError(result.error.message || 'Payment failed');
        this.state.update(s => ({ ...s, processing: false }));
        return;
      }

      const paymentIntent = result.paymentIntent;
      console.log('[PAYMENT] PaymentIntent status:', paymentIntent?.status);

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('[PAYMENT] ✅ Stripe confirmed payment, waiting for webhook...');
        // Stripe confirmed, now wait for webhook to update DB
        const paymentId = sessionStorage.getItem('current_payment_id');
        console.log('[PAYMENT] PaymentId:', paymentId);

        if (paymentId) {
          await this.waitForPaymentConfirmation(paymentId);
        } else {
          console.warn('[PAYMENT] No paymentId in session');
          this.state.update(s => ({ ...s, success: true, processing: false }));
          setTimeout(() => {
            this.router.navigate(['/payments/success']);
          }, 2000);
        }
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        console.warn('[PAYMENT] Requires additional authentication');
        this.updateError('Additional authentication required.');
      } else {
        console.error('[PAYMENT] Unknown paymentIntent status:', paymentIntent?.status);
        this.updateError('Payment processing failed');
        this.state.update(s => ({ ...s, processing: false }));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('[PAYMENT] Error:', errorMsg, err);
      this.updateError(errorMsg);
      this.state.update(s => ({ ...s, processing: false }));
    }
  }

  private async getClientSecret(): Promise<string> {
    const tier = this.cart.selectedTier();
    if (!tier) {
      throw new Error('No tier selected');
    }
    console.log('[PAYMENT] Selected tier:', tier);

    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    console.log('[PAYMENT] User:', user.username);

    const orderRef = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('[PAYMENT] Creating intent with orderReference:', orderRef);

    const response = await this.paymentService.createPaymentIntent({
      orderReference: orderRef,
      userId: user.id,
      amount: Math.round(tier.price * 100),
      currency: 'USD',
      description: `Energy tier: ${tier.name}`
    }).toPromise();

    console.log('[PAYMENT] Intent response:', response);

    if (!response?.clientSecret) {
      throw new Error('Failed to get payment client secret');
    }

    return response.clientSecret;
  }

  private async waitForPaymentConfirmation(paymentId: string): Promise<void> {
    const maxAttempts = 30; // 30 seconds (1s interval)
    let attempts = 0;
    console.log(`[PAYMENT-POLL] Starting poll for paymentId: ${paymentId}`);

    while (attempts < maxAttempts) {
      try {
        const payment = await this.paymentService.getPaymentStatus(paymentId).toPromise();
        console.log(`[PAYMENT-POLL] Attempt ${attempts + 1}/${maxAttempts} - Status:`, payment?.status);

        if (payment?.status === 'SUCCEEDED') {
          console.log('[PAYMENT-POLL] ✅ Payment SUCCEEDED!');
          this.state.update(s => ({ ...s, success: true, processing: false }));
          setTimeout(() => {
            this.router.navigate(['/payments/success']);
          }, 1000);
          return;
        }

        if (payment?.status === 'FAILED') {
          console.error('[PAYMENT-POLL] ❌ Payment FAILED');
          this.updateError('Payment was declined. Please try again.');
          this.state.update(s => ({ ...s, processing: false }));
          return;
        }

        console.log(`[PAYMENT-POLL] Status is ${payment?.status}, waiting 1s...`);
        // Wait 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      } catch (err) {
        console.error(`[PAYMENT-POLL] Error on attempt ${attempts + 1}:`, err);
        attempts++;
      }
    }

    // Timeout - assume success after 30 seconds
    console.warn('[PAYMENT-POLL] ⏱️ Timeout after 30s, assuming success');
    this.state.update(s => ({ ...s, success: true, processing: false }));
    setTimeout(() => {
      this.router.navigate(['/payments/success']);
    }, 1000);
  }

  private updateError(error: string | null): void {
    this.state.update(s => ({ ...s, error }));
  }

  ngOnDestroy(): void {
    if (this.cardElement) {
      this.cardElement.unmount();
    }
  }
}
