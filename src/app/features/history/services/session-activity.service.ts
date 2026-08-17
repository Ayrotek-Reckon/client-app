import { Injectable, signal } from '@angular/core';

export type ActivityType = 'mining_payout' | 'energy_purchase' | 'withdrawal';
export type ActivityStatus = 'completed' | 'processing' | 'failed';

export interface ActivityEntry {
  id: string;
  timestamp: string;
  type: ActivityType;
  label: string;
  reference: string;
  amount: number;
  status: ActivityStatus;
}

/**
 * There is no ledger/transaction-history endpoint anywhere in the backend.
 * This keeps an in-memory activity log for the session — seeded with a few
 * illustrative rows so the History page isn't empty on first load, and
 * appended to by the (also mock) Energy purchase and Withdraw flows so the
 * app feels connected end to end without pretending a real ledger exists.
 */
@Injectable({
  providedIn: 'root'
})
export class SessionActivityService {
  private entriesSignal = signal<ActivityEntry[]>([
    {
      id: 'seed-1',
      timestamp: '2023-10-24T14:32:01Z',
      type: 'mining_payout',
      label: 'Mining Payout',
      reference: 'TX-9982-A4B',
      amount: 450.25,
      status: 'completed'
    },
    {
      id: 'seed-2',
      timestamp: '2023-10-23T09:15:44Z',
      type: 'energy_purchase',
      label: 'Energy Purchase',
      reference: 'TX-7731-X9C',
      amount: -120.00,
      status: 'completed'
    },
    {
      id: 'seed-3',
      timestamp: '2023-10-22T22:05:11Z',
      type: 'withdrawal',
      label: 'Withdrawal',
      reference: 'TX-5510-Z2A',
      amount: -1000.00,
      status: 'processing'
    },
    {
      id: 'seed-4',
      timestamp: '2023-10-20T11:30:00Z',
      type: 'energy_purchase',
      label: 'Energy Purchase',
      reference: 'TX-3321-L7M',
      amount: -500.00,
      status: 'failed'
    }
  ]);

  entries = this.entriesSignal.asReadonly();

  logEnergyPurchase(orderNumber: string, amount: number): void {
    this.prepend({
      type: 'energy_purchase',
      label: 'Energy Purchase',
      reference: orderNumber,
      amount: -Math.abs(amount),
      status: 'completed'
    });
  }

  logWithdrawal(amount: number): void {
    this.prepend({
      type: 'withdrawal',
      label: 'Withdrawal',
      reference: this.generateReference(),
      amount: -Math.abs(amount),
      status: 'processing'
    });
  }

  private prepend(partial: Omit<ActivityEntry, 'id' | 'timestamp'>): void {
    const entry: ActivityEntry = {
      id: this.generateReference(),
      timestamp: new Date().toISOString(),
      ...partial
    };
    this.entriesSignal.update(list => [entry, ...list]);
  }

  private generateReference(): string {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `TX-${rand}-${suffix}`;
  }
}
