import { Component, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HiveOSService } from '../../services/hiveos.service';
import { FarmContextService } from '../../services/farm-context.service';
import { MiningStrategyService } from '../../services/mining-strategy.service';
import {
  ActiveMiningStrategy,
  HiveOSCoin,
  HiveOSMiner,
  HiveOSPoolTemplate,
  HiveOSWallet,
  HiveOSWorker,
  MiningStrategy
} from '../../models/hiveos.model';

const FALLBACK_COINS: HiveOSCoin[] = [
  { coin: 'ETC', name: 'Ethereum Classic', algos: ['etchash'] },
  { coin: 'RVN', name: 'Ravencoin', algos: ['kawpow'] },
  { coin: 'KAS', name: 'Kaspa', algos: ['heavyhash', 'kaspa'] },
  { coin: 'ERG', name: 'Ergo', algos: ['autolykos2'] }
];

const FALLBACK_MINERS: HiveOSMiner[] = [
  { id: 'teamredminer', name: 'TeamRedMiner' },
  { id: 't-rex', name: 'T-Rex Miner' },
  { id: 'lolminer', name: 'lolMiner' },
  { id: 'gminer', name: 'GMiner' }
];

const PREFERRED_MINERS_BY_ALGO: Record<string, string[]> = {
  etchash: ['teamredminer', 'lolminer', 'gminer', 't-rex', 'nbminer'],
  ethash: ['teamredminer', 'lolminer', 'gminer', 't-rex', 'nbminer'],
  kawpow: ['teamredminer', 't-rex', 'gminer', 'nbminer', 'lolminer'],
  autolykos2: ['teamredminer', 'lolminer', 'gminer', 'nbminer'],
  sha256: ['asicminer', 'apoolminer'],
  sha256d: ['asicminer', 'apoolminer'],
  scrypt: ['asicminer']
};

const POOL_HOME_URLS: Record<string, string> = {
  antpool: 'https://www.antpool.com',
  f2pool: 'https://www.f2pool.com',
  '2miners': 'https://2miners.com',
  nanopool: 'https://nanopool.org',
  binance: 'https://pool.binance.com',
  nicehash: 'https://www.nicehash.com'
};

const TWO_MINERS_HOSTS: Record<string, string> = {
  ETC: 'etc.2miners.com',
  ETHW: 'ethw.2miners.com',
  RVN: 'rvn.2miners.com',
  KAS: 'kas.2miners.com',
  ERG: 'erg.2miners.com',
  FLUX: 'flux.2miners.com',
  ZEC: 'zec.2miners.com',
  BTG: 'btg.2miners.com',
  XMR: 'xmr.2miners.com'
};

@Component({
  selector: 'app-mining-strategy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mining-strategy.component.html',
  styleUrls: ['./mining-strategy.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MiningStrategyComponent implements OnInit {
  farm = this.farmContext.currentFarm;
  farmsLoading = this.farmContext.isLoading$;
  farmsError = this.farmContext.error$;

  coins = signal<HiveOSCoin[]>([]);
  miners = signal<HiveOSMiner[]>([]);
  pools = signal<HiveOSPoolTemplate[]>([]);
  wallets = signal<HiveOSWallet[]>([]);
  workers = signal<HiveOSWorker[]>([]);
  strategies = signal<MiningStrategy[]>([]);

  catalogLoading = signal(false);
  farmDataLoading = signal(false);
  poolsLoading = signal(false);
  strategiesLoading = signal(false);
  actionInFlight = signal(false);

  actionError = signal<string | null>(null);
  actionSuccess = signal<string | null>(null);
  activeStrategyState = signal<ActiveMiningStrategy | null>(null);
  activeStrategyId = computed(() => this.activeStrategyState()?.strategyId ?? null);

  strategyName = signal('');
  selectedCoin = signal('');
  selectedAlgo = signal('');
  selectedMiner = signal('');
  selectedPool = signal('');
  selectedWalletId = signal<number | null>(null);
  selectedWorkerIds = signal<number[]>([]);
  poolSsl = signal(false);
  strategyNameTouched = signal(false);

  selectedCoinInfo = computed(() =>
    this.coins().find(c => c.coin === this.selectedCoin()) ?? null
  );

  selectedCoinAlgos = computed(() =>
    (this.selectedCoinInfo()?.algos ?? []).filter(Boolean)
  );

  selectedWallet = computed(() => {
    const walletId = this.selectedWalletId();
    return this.wallets().find(w => w.id === walletId) ?? null;
  });

  selectedPoolTemplate = computed(() => {
    const poolName = this.selectedPool();
    return this.pools().find(pool => pool.pool === poolName) ?? this.pools()[0] ?? null;
  });

  compatibleWallets = computed(() => {
    const coin = this.selectedCoin();
    return coin ? this.wallets().filter(w => w.coin.toUpperCase() === coin.toUpperCase()) : [];
  });

  selectedWorkerCount = computed(() => {
    const selected = this.selectedWorkerIds();
    return selected.length > 0 ? selected.length : this.workers().length;
  });

  canSubmit = computed(() =>
    !!this.farm()?.id &&
    !!this.selectedCoin() &&
    !!this.selectedAlgo() &&
    !!this.selectedMiner() &&
    !!this.selectedPool() &&
    !!this.selectedWallet()
  );

  constructor(
    private hiveosService: HiveOSService,
    private strategyService: MiningStrategyService,
    private farmContext: FarmContextService
  ) { }

  ngOnInit(): void {
    this.farmContext.ensureLoaded();
    this.loadCatalogs();
    this.loadStrategies();
    this.loadActiveStrategies();
    this.waitForFarmData();
  }

  selectCoin(coin: string): void {
    this.selectedCoin.set(coin);
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.selectDefaultAlgo();
    this.selectDefaultMiner();
    this.selectDefaultWallet();
    this.updateSuggestedName();
    this.loadPools(coin);
  }

  selectAlgo(algo: string): void {
    this.selectedAlgo.set(algo);
    this.selectDefaultMiner();
    this.updateSuggestedName();
  }

  selectMiner(miner: string): void {
    this.selectedMiner.set(miner);
    this.updateSuggestedName();
  }

  selectPool(pool: string): void {
    this.selectedPool.set(pool);
    this.updateSuggestedName();
  }

  updateStrategyName(name: string): void {
    this.strategyName.set(name);
    this.strategyNameTouched.set(!!name.trim());
    if (!name.trim()) {
      this.updateSuggestedName();
    }
  }

  updateWorkerSelection(workerIds: unknown): void {
    const values = Array.isArray(workerIds) ? workerIds : [workerIds];
    this.selectedWorkerIds.set(
      values
        .map(value => Number(value))
        .filter(value => Number.isFinite(value))
    );
  }

  saveStrategy(): void {
    const farmId = this.farm()?.id;
    const wallet = this.selectedWallet();
    if (!farmId || !wallet || !this.canSubmit()) return;

    this.actionInFlight.set(true);
    this.actionError.set(null);
    this.actionSuccess.set(null);
    const name = this.strategyName().trim() || this.suggestStrategyName();

    this.strategyService.create({
      name,
      farmId,
      coin: this.selectedCoin(),
      algo: this.selectedAlgo(),
      pool: this.selectedPool(),
      walletAddress: wallet.wal,
      miner: this.selectedMiner(),
      poolSsl: this.poolSsl(),
      workerIds: this.selectedWorkerIds().length > 0 ? this.selectedWorkerIds() : undefined
    }).subscribe({
      next: (strategy) => {
        this.strategies.update(list => [strategy, ...list]);
        this.actionSuccess.set(`Strategy "${strategy.name}" saved`);
        this.actionInFlight.set(false);
      },
      error: (err) => {
        this.actionError.set(err?.error?.message || 'Failed to save strategy');
        this.actionInFlight.set(false);
      }
    });
  }

  startNow(): void {
    const farmId = this.farm()?.id;
    const wallet = this.selectedWallet();
    if (!farmId || !wallet || !this.canSubmit()) return;

    this.actionInFlight.set(true);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    this.hiveosService.startMining(farmId, {
      coin: this.selectedCoin(),
      algo: this.selectedAlgo(),
      pool: this.selectedPool(),
      walletAddress: wallet.wal,
      miner: this.selectedMiner(),
      poolSsl: this.poolSsl(),
      workerIds: this.selectedWorkerIds().length > 0 ? this.selectedWorkerIds() : undefined
    }).subscribe({
      next: (response) => {
        this.activeStrategyState.set(null);
        this.strategyService.clearActive(farmId).subscribe();
        this.actionSuccess.set(`Mining started on "${response.flightSheetName}"`);
        this.actionInFlight.set(false);
      },
      error: (err) => {
        this.actionError.set(err?.error?.message || 'Failed to start mining');
        this.actionInFlight.set(false);
      }
    });
  }

  runStrategy(strategy: MiningStrategy): void {
    this.actionInFlight.set(true);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    this.strategyService.run(strategy.id).subscribe({
      next: (response) => {
        this.loadActiveStrategies();
        this.actionSuccess.set(`Strategy "${strategy.name}" started on "${response.flightSheetName}"`);
        this.actionInFlight.set(false);
      },
      error: (err) => {
        this.actionError.set(err?.error?.message || 'Failed to run strategy');
        this.actionInFlight.set(false);
      }
    });
  }

  deleteStrategy(strategy: MiningStrategy): void {
    if (!confirm(`Delete strategy "${strategy.name}"?`)) return;

    this.strategyService.delete(strategy.id).subscribe({
      next: () => {
        this.strategies.update(list => list.filter(item => item.id !== strategy.id));
        if (this.activeStrategyId() === strategy.id) {
          this.activeStrategyState.set(null);
        }
      },
      error: (err) => {
        this.actionError.set(err?.error?.message || 'Failed to delete strategy');
      }
    });
  }

  stopMining(): void {
    const farmId = this.farm()?.id;
    if (!farmId) return;

    this.actionInFlight.set(true);
    this.actionError.set(null);
    this.actionSuccess.set(null);

    this.hiveosService.stopMining(farmId).subscribe({
      next: () => {
        this.activeStrategyState.set(null);
        this.actionSuccess.set('Mining stopped');
        this.actionInFlight.set(false);
      },
      error: (err) => {
        this.actionError.set(err?.error?.message || 'Failed to stop mining');
        this.actionInFlight.set(false);
      }
    });
  }

  poolUrlPreview(pool: HiveOSPoolTemplate): string {
    const servers = pool.props?.servers ?? [];
    const first = servers.find(server => server.urls.length > 0 || (server.ssl_urls?.length ?? 0) > 0);
    if (!first) return 'No URLs';
    const urls = this.poolSsl() && first.ssl_urls?.length ? first.ssl_urls : first.urls;
    return urls[0] ?? 'No URLs';
  }

  shortAddress(address: string): string {
    return address.length <= 16 ? address : `${address.slice(0, 7)}...${address.slice(-5)}`;
  }

  selectedPoolStatusUrl(): string | null {
    const wallet = this.selectedWallet();
    if (!wallet || !this.selectedPool()) return null;
    return this.poolStatusUrl(this.selectedPool(), this.selectedCoin(), wallet.wal);
  }

  poolStatusUrl(pool: string, coin: string, walletAddress: string): string | null {
    const normalizedPool = pool.toLowerCase();
    const normalizedCoin = coin.toUpperCase();

    if (normalizedPool === '2miners') {
      const host = TWO_MINERS_HOSTS[normalizedCoin];
      return host ? `https://${host}/account/${encodeURIComponent(walletAddress)}` : 'https://2miners.com';
    }

    return POOL_HOME_URLS[normalizedPool] ?? null;
  }

  private loadCatalogs(): void {
    this.catalogLoading.set(true);
    forkJoin({
      coins: this.hiveosService.getCoins().pipe(catchError(() => of(FALLBACK_COINS))),
      miners: this.hiveosService.getMiners().pipe(catchError(() => of(FALLBACK_MINERS)))
    }).subscribe({
      next: ({ coins, miners }) => {
        this.coins.set(coins);
        this.miners.set(miners);
        this.catalogLoading.set(false);
        if (coins.length > 0) {
          this.selectCoin(coins[0].coin);
        }
      },
      error: () => this.catalogLoading.set(false)
    });
  }

  private loadStrategies(): void {
    this.strategiesLoading.set(true);
    this.strategyService.list().subscribe({
      next: (strategies) => {
        this.strategies.set(strategies);
        this.removeStaleActiveStrategy(strategies);
        this.strategiesLoading.set(false);
      },
      error: () => {
        this.strategiesLoading.set(false);
      }
    });
  }

  private loadActiveStrategies(): void {
    this.strategyService.listActive().subscribe({
      next: (activeStrategies) => {
        const currentFarmId = this.farm()?.id;
        const active = currentFarmId
          ? activeStrategies.find(item => item.farmId === currentFarmId)
          : activeStrategies[0];
        this.activeStrategyState.set(active ?? null);
      },
      error: () => {
        this.activeStrategyState.set(null);
      }
    });
  }

  private waitForFarmData(): void {
    const farmId = this.farm()?.id;
    if (!farmId) {
      setTimeout(() => this.waitForFarmData(), 250);
      return;
    }
    this.loadFarmData(farmId);
  }

  private loadFarmData(farmId: number): void {
    this.farmDataLoading.set(true);
    forkJoin({
      wallets: this.hiveosService.getWallets(farmId),
      workers: this.hiveosService.getWorkers(farmId)
    }).subscribe({
      next: ({ wallets, workers }) => {
        this.wallets.set(wallets);
        this.workers.set(workers);
        this.farmDataLoading.set(false);
        this.selectDefaultWallet();
        this.loadActiveStrategies();
      },
      error: () => {
        this.farmDataLoading.set(false);
        this.actionError.set('Failed to load farm wallets or workers');
      }
    });
  }

  private loadPools(coin: string): void {
    this.poolsLoading.set(true);
    this.pools.set([]);
    this.selectedPool.set('');

    this.hiveosService.getPoolsForCoin(coin).subscribe({
      next: (pools) => {
        this.pools.set(pools);
        this.selectedPool.set(pools[0]?.pool ?? '');
        this.poolsLoading.set(false);
        this.updateSuggestedName();
      },
      error: () => {
        this.poolsLoading.set(false);
      }
    });
  }

  private selectDefaultMiner(): void {
    const miners = this.miners();
    if (miners.length === 0 && this.selectedMiner()) {
      this.selectedMiner.set('');
      return;
    }
    if (miners.length === 0) return;

    const preferredMiner = this.preferredMinerForSelectedAlgo(miners);
    if (!miners.some(miner => miner.id === this.selectedMiner()) || preferredMiner) {
      this.selectedMiner.set(preferredMiner?.id ?? miners[0].id);
      this.updateSuggestedName();
    }
  }

  private selectDefaultAlgo(): void {
    const algos = this.selectedCoinAlgos();
    if (algos.length === 0) {
      this.selectedAlgo.set('');
      return;
    }
    if (!algos.includes(this.selectedAlgo())) {
      this.selectedAlgo.set(algos[0]);
    }
  }

  private preferredMinerForSelectedAlgo(miners: HiveOSMiner[]): HiveOSMiner | null {
    const algo = this.selectedAlgo().toLowerCase();
    const preferredIds = PREFERRED_MINERS_BY_ALGO[algo] ?? [];
    return preferredIds
      .map(id => miners.find(miner => miner.id === id))
      .find((miner): miner is HiveOSMiner => !!miner) ?? null;
  }

  private selectDefaultWallet(): void {
    const current = this.selectedWalletId();
    const wallets = this.compatibleWallets();
    if (wallets.length === 0) {
      this.selectedWalletId.set(null);
      return;
    }
    if (!wallets.some(wallet => wallet.id === current)) {
      this.selectedWalletId.set(wallets[0].id);
    }
  }

  private updateSuggestedName(): void {
    if (this.strategyNameTouched()) return;
    this.strategyName.set(this.suggestStrategyName());
  }

  private suggestStrategyName(): string {
    const coin = this.selectedCoin();
    const pool = this.selectedPool();
    const miner = this.selectedMiner();
    const algo = this.selectedAlgo();

    if (coin && pool && miner) return `${coin} ${algo || 'mining'} on ${pool} via ${miner}`;
    if (coin && pool) return `${coin} on ${pool}`;
    if (coin) return `${coin} mining strategy`;
    return 'Mining strategy';
  }

  private removeStaleActiveStrategy(strategies: MiningStrategy[]): void {
    const state = this.activeStrategyState();
    if (!state) return;

    const stillExists = strategies.some(strategy => strategy.id === state.strategyId);
    if (stillExists) return;

    this.activeStrategyState.set(null);
  }
}
