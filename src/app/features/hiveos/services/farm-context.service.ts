import { Injectable, signal, computed } from '@angular/core';
import { HiveOSService } from './hiveos.service';
import { HiveOSFarm } from '../models/hiveos.model';

/**
 * Resolves "the current farm" for pages that operate on a single farm
 * (Wallets, Mining Strategy, Withdraw) without requiring a farmId in the URL,
 * matching the Lumen design's top-level nav (no farm-picker step shown).
 * Defaults to the first farm; exposes a switcher for accounts with multiple farms.
 */
@Injectable({
  providedIn: 'root'
})
export class FarmContextService {
  private farmsSignal = signal<HiveOSFarm[]>([]);
  private currentFarmIdSignal = signal<number | null>(null);
  private isLoadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private loaded = false;

  farms$ = this.farmsSignal.asReadonly();
  isLoading$ = this.isLoadingSignal.asReadonly();
  error$ = this.errorSignal.asReadonly();

  currentFarm = computed(() => {
    const id = this.currentFarmIdSignal();
    return this.farmsSignal().find(f => f.id === id) ?? null;
  });

  hasMultipleFarms = computed(() => this.farmsSignal().length > 1);

  constructor(private hiveosService: HiveOSService) { }

  ensureLoaded(): void {
    if (this.loaded) return;
    this.load();
  }

  reload(): void {
    this.load();
  }

  private load(): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    this.hiveosService.getFarms().subscribe({
      next: (farms) => {
        this.farmsSignal.set(farms);
        this.loaded = true;
        this.isLoadingSignal.set(false);

        const current = this.currentFarmIdSignal();
        const stillValid = farms.some(f => f.id === current);
        if (!stillValid) {
          this.currentFarmIdSignal.set(farms.length > 0 ? farms[0].id : null);
        }
      },
      error: () => {
        this.errorSignal.set('Failed to load HiveOS farms');
        this.isLoadingSignal.set(false);
      }
    });
  }

  selectFarm(farmId: number): void {
    this.currentFarmIdSignal.set(farmId);
  }
}
