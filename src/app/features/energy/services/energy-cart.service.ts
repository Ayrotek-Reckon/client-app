import { Injectable, signal } from '@angular/core';

export interface EnergyTier {
  id: string;
  name: string;
  kWh: number;
  price: number;
  durationDays: number;
  popular?: boolean;
}

export const ENERGY_TIERS: EnergyTier[] = [
  { id: 'starter', name: 'Starter', kWh: 100, price: 15, durationDays: 7 },
  { id: 'standard', name: 'Standard', kWh: 250, price: 35, durationDays: 14 },
  { id: 'pro', name: 'Pro', kWh: 500, price: 65, durationDays: 30, popular: true },
  { id: 'enterprise', name: 'Enterprise', kWh: 1000, price: 120, durationDays: 60 }
];

export type PaymentMethodId = 'card' | 'crypto' | 'bank';

export interface CompletedOrder {
  orderNumber: string;
  tier: EnergyTier;
  paymentMethod: PaymentMethodId;
  completedAt: string;
}

/**
 * There is no energy-purchase/payment backend anywhere in the system.
 * This service holds cart state in memory for the duration of the session
 * (signals, no persistence, no HTTP) so the Energy -> Payments click-through
 * flow works end to end. The method shapes mirror what a real service would
 * expose, so swapping in an actual backend later only means changing the
 * internals of `checkout()`.
 */
@Injectable({
  providedIn: 'root'
})
export class EnergyCartService {
  private selectedTierSignal = signal<EnergyTier | null>(null);
  private selectedPaymentMethodSignal = signal<PaymentMethodId | null>(null);
  private lastOrderSignal = signal<CompletedOrder | null>(null);

  selectedTier = this.selectedTierSignal.asReadonly();
  selectedPaymentMethod = this.selectedPaymentMethodSignal.asReadonly();
  lastOrder = this.lastOrderSignal.asReadonly();

  selectTier(tier: EnergyTier): void {
    this.selectedTierSignal.set(tier);
    this.selectedPaymentMethodSignal.set(null);
  }

  selectPaymentMethod(method: PaymentMethodId): void {
    this.selectedPaymentMethodSignal.set(method);
  }

  checkout(): CompletedOrder | null {
    const tier = this.selectedTierSignal();
    const method = this.selectedPaymentMethodSignal();
    if (!tier || !method) return null;

    const order: CompletedOrder = {
      orderNumber: this.generateOrderNumber(),
      tier,
      paymentMethod: method,
      completedAt: new Date().toISOString()
    };
    this.lastOrderSignal.set(order);
    return order;
  }

  reset(): void {
    this.selectedTierSignal.set(null);
    this.selectedPaymentMethodSignal.set(null);
  }

  private generateOrderNumber(): string {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const suffix = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `LM-${rand}-${suffix}`;
  }
}
