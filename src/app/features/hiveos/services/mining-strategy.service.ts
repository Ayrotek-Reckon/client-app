import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ActiveMiningStrategy,
  MiningStrategy,
  MiningStrategyRequest,
  StartMiningResponse
} from '../models/hiveos.model';
import { API_CONFIG } from '../../../core/config/api.config';

/**
 * Talks to hiveos-integration's MiningStrategyController
 * (/api/v1/hiveos/strategies). Strategies are persisted and scoped to the
 * current user server-side via the gateway-forwarded X-User-Id header — the
 * client never sends an owner id. `run` re-applies a saved strategy to its farm.
 */
@Injectable({
  providedIn: 'root'
})
export class MiningStrategyService {
  private readonly base = `${API_CONFIG.apiUrl}${API_CONFIG.endpoints.hiveosStrategies}`;

  constructor(private http: HttpClient) { }

  list(): Observable<MiningStrategy[]> {
    return this.http.get<MiningStrategy[]>(this.base);
  }

  get(id: string): Observable<MiningStrategy> {
    return this.http.get<MiningStrategy>(`${this.base}/${id}`);
  }

  create(request: MiningStrategyRequest): Observable<MiningStrategy> {
    return this.http.post<MiningStrategy>(this.base, request);
  }

  update(id: string, request: MiningStrategyRequest): Observable<MiningStrategy> {
    return this.http.put<MiningStrategy>(`${this.base}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  run(id: string): Observable<StartMiningResponse> {
    return this.http.post<StartMiningResponse>(`${this.base}/${id}/run`, {});
  }

  listActive(): Observable<ActiveMiningStrategy[]> {
    return this.http.get<ActiveMiningStrategy[]>(`${this.base}/active`);
  }

  clearActive(farmId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/active/${farmId}`);
  }
}
