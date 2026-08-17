import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Node, Telemetry, PowerAdjustRequest } from '../models/gpu.model';
import { API_CONFIG } from '../../../core/config/api.config';

/**
 * Talks to gpu-monitoring-service's NodeController (/api/v1/nodes).
 * The rig-client-facing endpoints (initialize, heartbeat) are intentionally
 * not exposed here — this service only covers the admin/management surface.
 */
@Injectable({
  providedIn: 'root'
})
export class GpuMonitoringService {
  constructor(private http: HttpClient) { }

  getNodes(): Observable<Node[]> {
    return this.http.get<Node[]>(
      `${API_CONFIG.apiUrl}${API_CONFIG.endpoints.nodes}`
    );
  }

  getNode(nodeId: string): Observable<Node> {
    return this.http.get<Node>(
      `${API_CONFIG.apiUrl}${API_CONFIG.endpoints.nodes}/${nodeId}`
    );
  }

  approveNode(nodeId: string): Observable<Node> {
    return this.http.post<Node>(
      `${API_CONFIG.apiUrl}${API_CONFIG.endpoints.nodes}/${nodeId}/approve`,
      {}
    );
  }

  revokeNode(nodeId: string): Observable<Node> {
    return this.http.post<Node>(
      `${API_CONFIG.apiUrl}${API_CONFIG.endpoints.nodes}/${nodeId}/revoke`,
      {}
    );
  }

  /**
   * Queues a total wattage setpoint; delivered to the rig on its next heartbeat.
   * This is NOT a restart/reboot — the node has no such command.
   */
  adjustPower(nodeId: string, setpointPowerW: number): Observable<void> {
    const body: PowerAdjustRequest = { setpointPowerW };
    return this.http.post<void>(
      `${API_CONFIG.apiUrl}${API_CONFIG.endpoints.nodes}/${nodeId}/power`,
      body
    );
  }

  getTelemetry(nodeId: string, limit: number = 50): Observable<Telemetry[]> {
    const params = new HttpParams().set('limit', Math.min(limit, 500).toString());

    return this.http.get<Telemetry[]>(
      `${API_CONFIG.apiUrl}${API_CONFIG.endpoints.nodes}/${nodeId}/telemetry`,
      { params }
    );
  }
}
