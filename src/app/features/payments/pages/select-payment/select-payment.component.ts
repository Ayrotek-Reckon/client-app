import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EnergyCartService, PaymentMethodId } from '../../../energy/services/energy-cart.service';

interface PaymentOption {
  id: PaymentMethodId;
  title: string;
  icon: string;
  description: string;
  badges: string[];
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'card',
    title: 'Credit/Debit Card',
    icon: 'credit_card',
    description: 'Standard 2.9% + $0.30 processing fee applies.',
    badges: ['VISA', 'MC']
  },
  {
    id: 'crypto',
    title: 'Crypto Payment',
    icon: 'currency_bitcoin',
    description: 'Pay via connected Web3 wallet or manual transfer. Zero platform fees.',
    badges: ['₿', 'Ξ', '$']
  },
  {
    id: 'bank',
    title: 'Bank Transfer',
    icon: 'account_balance',
    description: 'ACH or Wire Transfer. Takes 1-3 business days to clear.',
    badges: []
  }
];

@Component({
  selector: 'app-select-payment',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './select-payment.component.html',
  styleUrls: ['./select-payment.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectPaymentComponent {
  options = PAYMENT_OPTIONS;
  tier = this.cart.selectedTier;
  selected = this.cart.selectedPaymentMethod;

  networkFee = 1.20;

  constructor(
    private cart: EnergyCartService,
    private router: Router
  ) {
    if (!this.selected()) {
      this.cart.selectPaymentMethod('crypto');
    }
  }

  select(id: PaymentMethodId): void {
    this.cart.selectPaymentMethod(id);
  }

  get total(): number {
    return (this.tier()?.price ?? 0) + this.networkFee;
  }

  continue(): void {
    this.router.navigate(['/payments/review']);
  }
}
