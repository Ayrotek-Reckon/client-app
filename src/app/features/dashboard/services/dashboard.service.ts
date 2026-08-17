import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { GpuMonitoringService } from '../../gpu-monitoring/services/gpu-monitoring.service';
import { HiveOSService } from '../../hiveos/services/hiveos.service';
import { Node } from '../../gpu-monitoring/models/gpu.model';
import { HiveOSFarm } from '../../hiveos/models/hiveos.model';

export interface DashboardStats {
  totalNodes: number;
  onlineNodes: number;
  pendingNodes: number;
  totalNodeGpus: number;
  farmCount: number;
  totalHiveWorkers: number;
  onlineHiveWorkers: number;
  totalHiveGpus: number;
  onlineHiveGpus: number;
  hivePowerDrawW: number;
}

export interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

export interface DashboardData {
  stats: DashboardStats;
  alerts: AlertItem[];
}

/**
 * There is no dashboard-service in the backend. This service builds a dashboard
 * view by combining data already exposed by gpu-monitoring-service (nodes) and
 * hiveos-integration (farms), rather than calling a non-existent aggregate endpoint.
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private gpuService: GpuMonitoringService,
    private hiveosService: HiveOSService
  ) { }

  getDashboardData(): Observable<DashboardData> {
    return forkJoin({
      nodes: this.gpuService.getNodes().pipe(catchError(() => of([] as Node[]))),
      farms: this.hiveosService.getFarms().pipe(catchError(() => of([] as HiveOSFarm[])))
    }).pipe(
      map(({ nodes, farms }) => ({
        stats: this.buildStats(nodes, farms),
        alerts: this.buildAlerts(nodes, farms)
      }))
    );
  }

  private buildStats(nodes: Node[], farms: HiveOSFarm[]): DashboardStats {
    return {
      totalNodes: nodes.length,
      onlineNodes: nodes.filter(n => n.online).length,
      pendingNodes: nodes.filter(n => n.status === 'PENDING').length,
      totalNodeGpus: nodes.reduce((sum, n) => sum + n.gpus.length, 0),
      farmCount: farms.length,
      totalHiveWorkers: farms.reduce((sum, f) => sum + (f.stats?.workers_total ?? f.workers_count ?? 0), 0),
      onlineHiveWorkers: farms.reduce((sum, f) => sum + (f.stats?.workers_online ?? 0), 0),
      totalHiveGpus: farms.reduce((sum, f) => sum + (f.stats?.gpus_total ?? 0), 0),
      onlineHiveGpus: farms.reduce((sum, f) => sum + (f.stats?.gpus_online ?? 0), 0),
      hivePowerDrawW: farms.reduce((sum, f) => sum + (f.stats?.power_draw ?? 0), 0)
    };
  }

  private buildAlerts(nodes: Node[], farms: HiveOSFarm[]): AlertItem[] {
    const alerts: AlertItem[] = [];
    const now = new Date().toISOString();

    nodes.filter(n => n.status === 'PENDING').forEach(n => {
      alerts.push({
        id: `node-pending-${n.id}`,
        type: 'info',
        title: 'Node awaiting approval',
        message: `${n.hardwareId} registered and is waiting for admin approval`,
        timestamp: n.createdAt || now
      });
    });

    nodes.filter(n => n.status === 'APPROVED' && !n.online).forEach(n => {
      alerts.push({
        id: `node-offline-${n.id}`,
        type: 'warning',
        title: 'Node offline',
        message: `${n.hardwareId} has not sent a heartbeat recently`,
        timestamp: n.lastHeartbeatAt || now
      });
    });

    farms.filter(f => f.locked).forEach(f => {
      alerts.push({
        id: `farm-locked-${f.id}`,
        type: 'error',
        title: 'Farm locked',
        message: `${f.name} is locked (e.g. overdraft) — sub-resource calls will return 403`,
        timestamp: now
      });
    });

    return alerts;
  }
}
