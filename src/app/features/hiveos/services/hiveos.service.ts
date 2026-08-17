import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  HiveOSFarm,
  HiveOSWorker,
  HiveOSWallet,
  HiveOSWalletCreateRequest,
  HiveOSFlightSheet,
  HiveOSFlightSheetCreateRequest,
  HiveOSCommandRequest,
  StartMiningRequest,
  StartMiningResponse,
  StopMiningRequest,
  HiveOSPoolTemplate,
  HiveOSCoin,
  HiveOSMiner,
  HiveOSAlgo
} from '../models/hiveos.model';
import { API_CONFIG } from '../../../core/config/api.config';

/**
 * Talks to hiveos-integration's HiveosController and MiningController
 * (/api/v1/hiveos/**). Farm/worker/wallet/flight-sheet ids are numeric.
 */
@Injectable({
  providedIn: 'root'
})
export class HiveOSService {
  private readonly base = `${API_CONFIG.apiUrl}${API_CONFIG.endpoints.hiveosFarms}`;

  constructor(private http: HttpClient) { }

  // --- Farms ---

  getFarms(): Observable<HiveOSFarm[]> {
    return this.http.get<HiveOSFarm[]>(this.base);
  }

  getFarm(farmId: number): Observable<HiveOSFarm> {
    return this.http.get<HiveOSFarm>(`${this.base}/${farmId}`);
  }

  // --- Workers ---

  getWorkers(farmId: number): Observable<HiveOSWorker[]> {
    return this.http.get<HiveOSWorker[]>(`${this.base}/${farmId}/workers`);
  }

  getWorker(farmId: number, workerId: number): Observable<HiveOSWorker> {
    return this.http.get<HiveOSWorker>(`${this.base}/${farmId}/workers/${workerId}`);
  }

  executeCommand(farmId: number, workerId: number, request: HiveOSCommandRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/${farmId}/workers/${workerId}/command`, request);
  }

  // --- Flight sheets ---

  getFlightSheets(farmId: number): Observable<HiveOSFlightSheet[]> {
    return this.http.get<HiveOSFlightSheet[]>(`${this.base}/${farmId}/fs`);
  }

  getFlightSheet(farmId: number, fsId: number): Observable<HiveOSFlightSheet> {
    return this.http.get<HiveOSFlightSheet>(`${this.base}/${farmId}/fs/${fsId}`);
  }

  createFlightSheet(farmId: number, request: HiveOSFlightSheetCreateRequest): Observable<HiveOSFlightSheet> {
    return this.http.post<HiveOSFlightSheet>(`${this.base}/${farmId}/fs`, request);
  }

  updateFlightSheet(farmId: number, fsId: number, request: HiveOSFlightSheetCreateRequest): Observable<void> {
    return this.http.patch<void>(`${this.base}/${farmId}/fs/${fsId}`, request);
  }

  deleteFlightSheet(farmId: number, fsId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${farmId}/fs/${fsId}`);
  }

  // --- Wallets ---

  getWallets(farmId: number): Observable<HiveOSWallet[]> {
    return this.http.get<HiveOSWallet[]>(`${this.base}/${farmId}/wallets`);
  }

  getWallet(farmId: number, walletId: number): Observable<HiveOSWallet> {
    return this.http.get<HiveOSWallet>(`${this.base}/${farmId}/wallets/${walletId}`);
  }

  createWallet(farmId: number, request: HiveOSWalletCreateRequest): Observable<HiveOSWallet> {
    return this.http.post<HiveOSWallet>(`${this.base}/${farmId}/wallets`, request);
  }

  deleteWallet(farmId: number, walletId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${farmId}/wallets/${walletId}`);
  }

  // --- Mining control ---

  startMining(farmId: number, request: StartMiningRequest): Observable<StartMiningResponse> {
    return this.http.post<StartMiningResponse>(`${this.base}/${farmId}/mining/start`, request);
  }

  stopMining(farmId: number, request?: StopMiningRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/${farmId}/mining/stop`, request ?? {});
  }

  getPoolsForCoin(coin: string): Observable<HiveOSPoolTemplate[]> {
    return this.http.get<HiveOSPoolTemplate[]>(
      `${API_CONFIG.apiUrl}${API_CONFIG.endpoints.hiveosPools}/${coin}`
    );
  }

  // --- Strategy-builder discovery catalogs ---

  getCoins(): Observable<HiveOSCoin[]> {
    return this.http.get<HiveOSCoin[]>(`${API_CONFIG.apiUrl}${API_CONFIG.endpoints.hiveosCoins}`);
  }

  getMiners(): Observable<HiveOSMiner[]> {
    return this.http.get<HiveOSMiner[]>(`${API_CONFIG.apiUrl}${API_CONFIG.endpoints.hiveosMiners}`);
  }

  getAlgos(): Observable<HiveOSAlgo[]> {
    return this.http.get<HiveOSAlgo[]>(`${API_CONFIG.apiUrl}${API_CONFIG.endpoints.hiveosAlgos}`);
  }
}
