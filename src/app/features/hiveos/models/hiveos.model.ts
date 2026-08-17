/**
 * Models mirroring hiveos-integration's client DTOs
 * (com.ayrotek.reckon.hiveosintegration.client.dto.*).
 * Farm/worker/wallet ids are numeric (Long) on the backend, not strings.
 *
 * IMPORTANT: Fields annotated with @JsonProperty("snake_case") on the Java
 * side (to mirror the external HiveOS API schema) are serialized in that
 * SAME snake_case form by our own backend's own JSON responses — Jackson
 * uses @JsonProperty for both directions. Verified empirically against the
 * live API: `GET /hiveos/farms` returns
 * `{"workers_count":1,"stats":{"workers_online":1,"gpus_online":6,"power_draw":634}}`
 * — NOT camelCase. These interfaces intentionally keep the wire's real
 * snake_case key names rather than camelCase, so `undefined` field access
 * bugs (dashboard/farms showing 0 while the account has real data) can't
 * silently reappear. Fields without a Java @JsonProperty annotation
 * (HiveosWallet, StartMiningRequest/Response, HiveosCommandRequest, etc.)
 * are genuinely camelCase on the wire and are left as such below.
 */

export interface HiveOSFarmStats {
  workers_total: number | null;
  workers_online: number | null;
  workers_offline: number | null;
  gpus_total: number | null;
  gpus_online: number | null;
  power_draw: number | null;
  power_cost: number | null;
  asr: number | null;
}

export interface HiveOSFarm {
  id: number;
  name: string;
  timezone: string | null;
  role: string | null;
  locked: boolean | null;
  twofa_required: boolean | null;
  trusted: boolean | null;
  workers_count: number | null;
  rigs_count: number | null;
  asics_count: number | null;
  stats: HiveOSFarmStats | null;
}

export interface HiveOSWorkerStats {
  online: boolean | null;
  boot_time: number | null;
  stats_time: number | null;
  gpus_online: number | null;
  gpus_offline: number | null;
  power_draw: number | null;
  overheated: boolean | null;
  invalid: boolean | null;
}

export interface HiveOSWorker {
  id: number;
  farm_id: number;
  name: string;
  description: string | null;
  active: boolean | null;
  platform: number | null;
  ip_addresses: string[] | null;
  stats: HiveOSWorkerStats | null;
}

export interface HiveOSWallet {
  id: number;
  coin: string;
  name: string;
  wal: string;
}

export interface HiveOSWalletCreateRequest {
  coin: string;
  name: string;
  wal: string;
}

export interface HiveOSFsItem {
  coin: string;
  pool: string | null;
  pool_ssl?: boolean | null;
  pool_urls: string[] | null;
  wal_id: number | null;
  miner: string | null;
  miner_config: Record<string, any> | null;
}

export interface HiveOSFlightSheet {
  id: number;
  name: string;
  items: HiveOSFsItem[] | null;
  workers_count: number | null;
}

export interface HiveOSFlightSheetCreateRequest {
  name: string;
  items: HiveOSFsItem[];
}

export interface HiveOSCommandRequest {
  command: string;
  data?: Record<string, any>;
}

/**
 * POST /api/v1/hiveos/farms/{farmId}/mining/start
 * StartMiningRequest/Response have no @JsonProperty overrides on the Java
 * side — genuinely camelCase on the wire.
 */
export interface StartMiningRequest {
  coin: string;
  algo?: string;
  pool: string;
  walletAddress: string;
  miner: string;
  minerConfig?: Record<string, any>;
  poolSsl?: boolean;
  poolUrls?: string[];
  workerIds?: number[];
}

export interface StartMiningResponse {
  walletId: number;
  flightSheetId: number;
  flightSheetName: string;
  poolUrls: string[];
  appliedWorkerIds: number[];
}

export interface StopMiningRequest {
  workerIds?: number[];
}

export interface HiveOSPoolTemplateServer {
  geo: string | null;
  urls: string[];
  ssl_urls: string[] | null;
}

export interface HiveOSPoolTemplate {
  pool: string;
  coin: string;
  props: { servers: HiveOSPoolTemplateServer[] } | null;
}

/**
 * Derived, frontend-only aggregate over the farms list — not returned by the backend.
 */
export interface HiveOSStats {
  farmCount: number;
  totalWorkers: number;
  onlineWorkers: number;
  totalGpus: number;
  onlineGpus: number;
}

/* ---------------------------------------------------------------------------
 * Strategy-builder discovery catalogs.
 * GET /api/v1/hiveos/{coins,miners,algos} — proxied from HiveOS /hive/*.
 * Single-word fields, so camelCase == snake_case on the wire.
 * ------------------------------------------------------------------------- */

export interface HiveOSCoin {
  id?: number;
  coin: string;
  name: string | null;
  algos?: string[] | null;
}

export interface HiveOSMiner {
  /** Passed as `miner` to mining/start, e.g. "t-rex", "lolminer". */
  id: string;
  name: string;
}

export interface HiveOSAlgo {
  algo: string;
  name: string | null;
}

/* ---------------------------------------------------------------------------
 * Reusable, user-owned mining strategies.
 * /api/v1/hiveos/strategies — MiningStrategyRequest/Response have no
 * @JsonProperty overrides and the service does NOT use SNAKE_CASE, so these
 * are genuinely camelCase on the wire.
 * ------------------------------------------------------------------------- */

/**
 * Create/update payload. Mirrors StartMiningRequest plus `name` and `farmId`.
 * Ownership is derived server-side from the gateway X-User-Id header — never sent here.
 */
export interface MiningStrategyRequest {
  name: string;
  farmId: number;
  coin: string;
  algo?: string;
  pool: string;
  walletAddress: string;
  miner: string;
  minerConfig?: Record<string, any>;
  poolSsl?: boolean;
  poolUrls?: string[];
  workerIds?: number[];
}

export interface MiningStrategy {
  id: string;
  name: string;
  farmId: number;
  coin: string;
  algo?: string;
  pool: string;
  walletAddress: string;
  miner: string;
  minerConfig: Record<string, any> | null;
  poolSsl: boolean | null;
  poolUrls: string[] | null;
  workerIds: number[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveMiningStrategy {
  strategyId: string;
  farmId: number;
  strategyName: string;
  flightSheetId: number;
  flightSheetName: string;
  startedAt: string;
}
