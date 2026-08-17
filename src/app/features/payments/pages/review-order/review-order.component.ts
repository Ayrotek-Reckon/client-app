import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EnergyCartService } from '../../../energy/services/energy-cart.service';
import { SessionActivityService } from '../../../history/services/session-activity.service';
import { StripeCardPaymentComponent } from '../stripe-card-payment/stripe-card-payment.component';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: 'Credit Card',
  crypto: 'Crypto Payment',
  bank: 'Bank Transfer'
};

@Component({
  selector: 'app-review-order',
  standalone: true,
  imports: [CommonModule, RouterLink, StripeCardPaymentComponent],
  templateUrl: './review-order.component.html',
  styleUrls: ['./review-order.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewOrderComponent {
  tier = this.cart.selectedTier;
  paymentMethod = this.cart.selectedPaymentMethod;
  processing = signal(false);

  constructor(
    private cart: EnergyCartService,
    private activity: SessionActivityService,
    private router: Router
  ) { }

  paymentMethodLabel(): string {
    const method = this.paymentMethod();
    return method ? PAYMENT_METHOD_LABELS[method] : '';
  }

  completePurchase(): void {
    this.processing.set(true);

    setTimeout(() => {
      const order = this.cart.checkout();
      if (order) {
        this.activity.logEnergyPurchase(order.orderNumber, order.tier.price);
      }
      this.processing.set(false);
      this.router.navigate(['/payments/success']);
    }, 900);
  }
}
