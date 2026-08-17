import { Component, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HiveOSService } from '../../../hiveos/services/hiveos.service';
import { FarmContextService } from '../../../hiveos/services/farm-context.service';
import { HiveOSWallet } from '../../../hiveos/models/hiveos.model';
import { SessionActivityService } from '../../../history/services/session-activity.service';

/**
 * There is no withdrawal/balance backend endpoint. The available balance
 * shown here is a local placeholder so the flow can be demonstrated
 * end-to-end; the destination-wallet list below is real (HiveOS wallets).
 */
const MOCK_AVAILABLE_BALANCE = 12450.00;
const NETWORK_FEE = 2.50;

@Component({
  selector: 'app-withdraw-funds',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './withdraw-funds.component.html',
  styleUrls: ['./withdraw-funds.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WithdrawFundsComponent implements OnInit {
  availableBalance = MOCK_AVAILABLE_BALANCE;
  networkFee = NETWORK_FEE;

  farm = this.farmContext.currentFarm;
  wallets = signal<HiveOSWallet[]>([]);

  step = signal<1 | 2>(1);
  destinationWalletId = signal<number | null>(null);
  amount = signal<number | null>(null);
  submitting = signal(false);

  destinationWallet = computed(() =>
    this.wallets().find(w => w.id === this.destinationWalletId()) ?? null
  );

  receiveAmount = computed(() => {
    const amt = this.amount() ?? 0;
    return Math.max(amt - this.networkFee, 0);
  });

  canReview = computed(() => {
    const amt = this.amount();
    return !!this.destinationWalletId() && !!amt && amt > 0 && amt <= this.availableBalance;
  });

  constructor(
    private hiveosService: HiveOSService,
    private farmContext: FarmContextService,
    private activity: SessionActivityService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.farmContext.ensureLoaded();
    this.pollForFarm();
  }

  private pollForFarm(): void {
    const farmId = this.farm()?.id;
    if (!farmId) {
      setTimeout(() => this.pollForFarm(), 300);
      return;
    }
    this.hiveosService.getWallets(farmId).subscribe({
      next: (wallets) => {
        this.wallets.set(wallets);
        if (wallets.length > 0) this.destinationWalletId.set(wallets[0].id);
      }
    });
  }

  setMaxAmount(): void {
    this.amount.set(this.availableBalance);
  }

  goToReview(): void {
    if (this.canReview()) this.step.set(2);
  }

  goBackToDetails(): void {
    this.step.set(1);
  }

  confirmWithdrawal(): void {
    const amt = this.amount();
    if (!amt) return;

    this.submitting.set(true);

    setTimeout(() => {
      this.activity.logWithdrawal(amt);
      this.submitting.set(false);
      this.router.navigate(['/wallet']);
    }, 900);
  }
}
