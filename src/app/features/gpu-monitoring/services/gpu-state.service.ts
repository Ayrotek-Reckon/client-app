import { Injectable, signal, computed } from '@angular/core';
import { GpuMonitoringService } from './gpu-monitoring.service';
import { Node, Telemetry, NodeStats } from '../models/gpu.model';
import { interval } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GpuStateService {
  private nodesSignal = signal<Node[]>([]);
  private selectedNodeSignal = signal<Node | null>(null);
  private telemetrySignal = signal<Telemetry[]>([]);
  private isLoadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  nodes$ = this.nodesSignal.asReadonly();
  selectedNode$ = this.selectedNodeSignal.asReadonly();
  telemetry$ = this.telemetrySignal.asReadonly();
  isLoading$ = this.isLoadingSignal.asReadonly();
  error$ = this.errorSignal.asReadonly();

  onlineCount = computed(() =>
    this.nodesSignal().filter(n => n.online).length
  );

  offlineCount = computed(() =>
    this.nodesSignal().filter(n => !n.online && n.status === 'APPROVED').length
  );

  pendingCount = computed(() =>
    this.nodesSignal().filter(n => n.status === 'PENDING').length
  );

  revokedCount = computed(() =>
    this.nodesSignal().filter(n => n.status === 'REVOKED').length
  );

  stats = computed<NodeStats>(() => {
    const nodes = this.nodesSignal();
    return {
      totalNodes: nodes.length,
      onlineNodes: nodes.filter(n => n.online).length,
      offlineNodes: nodes.filter(n => !n.online && n.status === 'APPROVED').length,
      pendingNodes: nodes.filter(n => n.status === 'PENDING').length,
      approvedNodes: nodes.filter(n => n.status === 'APPROVED').length,
      revokedNodes: nodes.filter(n => n.status === 'REVOKED').length,
      totalGpus: nodes.reduce((sum, n) => sum + n.gpus.length, 0)
    };
  });

  constructor(private gpuService: GpuMonitoringService) {
    this.initAutoRefresh();
  }

  loadNodes(): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    this.gpuService.getNodes().subscribe({
      next: (nodes) => {
        this.nodesSignal.set(nodes);
        this.isLoadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set('Failed to load nodes');
        this.isLoadingSignal.set(false);
        console.error('Node load error:', err);
      }
    });
  }

  loadNode(nodeId: string): void {
    this.isLoadingSignal.set(true);

    this.gpuService.getNode(nodeId).subscribe({
      next: (node) => {
        this.selectedNodeSignal.set(node);
        this.isLoadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set('Failed to load node');
        this.isLoadingSignal.set(false);
      }
    });
  }

  loadTelemetry(nodeId: string, limit: number = 50): void {
    this.gpuService.getTelemetry(nodeId, limit).subscribe({
      next: (telemetry) => {
        this.telemetrySignal.set(telemetry);
      },
      error: (err) => {
        console.error('Telemetry load error:', err);
      }
    });
  }

  approveNode(nodeId: string): void {
    this.gpuService.approveNode(nodeId).subscribe({
      next: (updated) => this.replaceNode(updated),
      error: (err) => {
        this.errorSignal.set('Failed to approve node');
        console.error('Approve node error:', err);
      }
    });
  }

  revokeNode(nodeId: string): void {
    this.gpuService.revokeNode(nodeId).subscribe({
      next: (updated) => this.replaceNode(updated),
      error: (err) => {
        this.errorSignal.set('Failed to revoke node');
        console.error('Revoke node error:', err);
      }
    });
  }

  adjustPower(nodeId: string, setpointPowerW: number): void {
    this.gpuService.adjustPower(nodeId, setpointPowerW).subscribe({
      error: (err) => {
        this.errorSignal.set('Failed to queue power adjustment');
        console.error('Power adjust error:', err);
      }
    });
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  private replaceNode(updated: Node): void {
    const nodes = this.nodesSignal();
    const index = nodes.findIndex(n => n.id === updated.id);
    if (index > -1) {
      const next = [...nodes];
      next[index] = updated;
      this.nodesSignal.set(next);
    }
    if (this.selectedNodeSignal()?.id === updated.id) {
      this.selectedNodeSignal.set(updated);
    }
  }

  private initAutoRefresh(): void {
    // Auto-refresh node list every 30 seconds
    interval(30000).pipe(
      switchMap(() => this.gpuService.getNodes()),
      catchError((err) => {
        console.error('Auto-refresh error:', err);
        return of(null);
      })
    ).subscribe((nodes) => {
      if (nodes) {
        this.nodesSignal.set(nodes);
      }
    });
  }
}
