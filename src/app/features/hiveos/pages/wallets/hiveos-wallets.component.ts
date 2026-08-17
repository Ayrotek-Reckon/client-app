import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HiveOSService } from '../../services/hiveos.service';
import { FarmContextService } from '../../services/farm-context.service';
import { HiveOSCoin, HiveOSWallet } from '../../models/hiveos.model';

const FALLBACK_COINS: HiveOSCoin[] = [
  { coin: 'ETC', name: 'Ethereum Classic', algos: ['etchash'] },
  { coin: 'RVN', name: 'Ravencoin', algos: ['kawpow'] },
  { coin: 'KAS', name: 'Kaspa', algos: ['heavyhash', 'kaspa'] },
  { coin: 'ERG', name: 'Ergo', algos: ['autolykos2'] },
  { coin: 'BTC', name: 'Bitcoin', algos: ['sha256'] }
];

@Component({
  selector: 'app-hiveos-wallets',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './hiveos-wallets.component.html',
  styleUrls: ['./hiveos-wallets.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HiveOSWalletsComponent implements OnInit {
  farm = this.farmContext.currentFarm;
  farmsLoading = this.farmContext.isLoading$;
  farmsError = this.farmContext.error$;

  wallets = signal<HiveOSWallet[]>([]);
  coins = signal<HiveOSCoin[]>([]);
  isLoading = signal(false);
  coinsLoading = signal(false);
  error = signal<string | null>(null);

  /** No default-wallet concept exists on the backend — tracked locally only. */
  defaultWalletId = signal<number | null>(null);

  showAddModal = signal(false);
  newCoin = signal('');
  newName = signal('');
  nameTouched = signal(false);
  newAddress = signal('');
  saving = signal(false);
  saveError = signal<string | null>(null);
  deleteCandidate = signal<HiveOSWallet | null>(null);
  deleteInFlight = signal(false);
  deleteError = signal<string | null>(null);

  constructor(
    private hiveosService: HiveOSService,
    private farmContext: FarmContextService
  ) { }

  ngOnInit(): void {
    this.farmContext.ensureLoaded();
    this.loadCoins();
    this.pollForFarm();
  }

  private pollForFarm(): void {
    const farmId = this.farm()?.id;
    if (!farmId) {
      if (this.farmsLoading()) {
        setTimeout(() => this.pollForFarm(), 300);
      }
      return;
    }
    this.loadWallets();
  }

  loadWallets(): void {
    const farmId = this.farm()?.id;
    if (!farmId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.hiveosService.getWallets(farmId).subscribe({
      next: (wallets) => {
        this.wallets.set(wallets);
        this.isLoading.set(false);
        if (this.defaultWalletId() === null && wallets.length > 0) {
          this.defaultWalletId.set(wallets[0].id);
        }
      },
      error: () => {
        this.error.set('Failed to load wallets');
        this.isLoading.set(false);
      }
    });
  }

  loadCoins(): void {
    this.coinsLoading.set(true);
    this.hiveosService.getCoins()
      .pipe(catchError(() => of(FALLBACK_COINS)))
      .subscribe({
        next: (coins) => {
          this.coins.set(this.sortCoins(coins));
          this.coinsLoading.set(false);
        },
        error: () => {
          this.coins.set(FALLBACK_COINS);
          this.coinsLoading.set(false);
        }
      });
  }

  iconFor(coin: string): string {
    const c = coin.toUpperCase();
    if (c === 'BTC' || c === 'ETC' || c === 'ETH') return 'currency_bitcoin';
    return 'account_balance_wallet';
  }

  shortAddress(address: string): string {
    if (address.length <= 14) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  setDefault(walletId: number): void {
    this.defaultWalletId.set(walletId);
  }

  copyAddress(address: string): void {
    navigator.clipboard?.writeText(address).catch(() => { });
  }

  openAddModal(): void {
    const coin = this.coins()[0]?.coin ?? '';
    this.newCoin.set(coin);
    this.newName.set(this.suggestWalletName(coin));
    this.nameTouched.set(false);
    this.newAddress.set('');
    this.saveError.set(null);
    this.showAddModal.set(true);
  }

  selectCoin(coin: string): void {
    this.newCoin.set(coin);
    if (!this.nameTouched()) {
      this.newName.set(this.suggestWalletName(coin));
    }
  }

  updateWalletName(name: string): void {
    this.newName.set(name);
    this.nameTouched.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  openDeleteModal(wallet: HiveOSWallet): void {
    this.deleteCandidate.set(wallet);
    this.deleteError.set(null);
  }

  closeDeleteModal(): void {
    if (this.deleteInFlight()) return;
    this.deleteCandidate.set(null);
    this.deleteError.set(null);
  }

  submitNewWallet(): void {
    const farmId = this.farm()?.id;
    const coin = this.newCoin().trim().toUpperCase();
    const name = this.newName().trim() || this.suggestWalletName(coin);
    const wal = this.newAddress().trim();
    if (!farmId || !coin || !wal) return;

    this.saving.set(true);
    this.saveError.set(null);

    this.hiveosService.createWallet(farmId, { coin, name, wal }).subscribe({
      next: (wallet) => {
        this.wallets.update(list => [...list, wallet]);
        this.saving.set(false);
        this.showAddModal.set(false);
      },
      error: (err) => {
        this.saveError.set(err?.error?.message || 'Failed to create wallet');
        this.saving.set(false);
      }
    });
  }

  private sortCoins(coins: HiveOSCoin[]): HiveOSCoin[] {
    const preferred = ['ETC', 'BTC', 'RVN', 'KAS', 'ERG'];
    return [...coins].sort((a, b) => {
      const aIndex = preferred.indexOf(a.coin.toUpperCase());
      const bIndex = preferred.indexOf(b.coin.toUpperCase());
      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex)
          - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
      }
      return a.coin.localeCompare(b.coin);
    });
  }

  private suggestWalletName(coin: string): string {
    const symbol = coin.trim().toUpperCase();
    return symbol ? `${symbol} Wallet` : 'Mining Wallet';
  }

  confirmDeleteWallet(): void {
    const farmId = this.farm()?.id;
    const wallet = this.deleteCandidate();
    if (!farmId || !wallet) return;

    this.deleteInFlight.set(true);
    this.deleteError.set(null);
    this.error.set(null);

    this.hiveosService.deleteWallet(farmId, wallet.id).subscribe({
      next: () => {
        this.wallets.update(list => list.filter(w => w.id !== wallet.id));
        if (this.defaultWalletId() === wallet.id) {
          this.defaultWalletId.set(this.wallets()[0]?.id ?? null);
        }
        this.deleteInFlight.set(false);
        this.deleteCandidate.set(null);
      },
      error: (err) => {
        this.deleteError.set(this.describeDeleteError(err));
        this.deleteInFlight.set(false);
      }
    });
  }

  private describeDeleteError(error: any): string {
    const message = String(error?.error?.message || error?.error?.error || error?.message || '').trim();

    if (error?.status === 409 || /used|flight|worker|conflict/i.test(message)) {
      return 'This wallet is still used by a flight sheet or worker. Remove it from the related mining configuration before deleting it.';
    }

    if (error?.status === 400 || /missing id|not found|invalid/i.test(message)) {
      return message || 'HiveOS rejected the wallet delete request. Refresh wallets and try again.';
    }

    if (error?.status === 0) {
      return 'Cannot reach HiveOS through the gateway. Check the connection and try again.';
    }

    return message || 'Failed to delete wallet. Please try again.';
  }

  deleteWallet(walletId: number): void {
    const wallet = this.wallets().find(item => item.id === walletId);
    if (wallet) {
      this.openDeleteModal(wallet);
    }
  }
}
