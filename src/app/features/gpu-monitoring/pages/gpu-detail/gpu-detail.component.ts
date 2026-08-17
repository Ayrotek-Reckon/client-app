import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GpuStateService } from '../../services/gpu-state.service';
import { GpuStatusBadgeComponent, NodeDisplayStatus } from '../../components/gpu-status-badge/gpu-status-badge.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-gpu-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, GpuStatusBadgeComponent, LoadingSpinnerComponent],
  templateUrl: './gpu-detail.component.html',
  styleUrls: ['./gpu-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GpuDetailComponent implements OnInit {
  node = this.gpuState.selectedNode$;
  isLoading = this.gpuState.isLoading$;
  error = this.gpuState.error$;
  telemetry = this.gpuState.telemetry$;

  powerSetpoint = signal<number | null>(null);

  private nodeId: string | null = null;

  constructor(
    private gpuState: GpuStateService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const nodeId = params['id'];
      if (nodeId) {
        this.nodeId = nodeId;
        this.gpuState.loadNode(nodeId);
        this.gpuState.loadTelemetry(nodeId);
      }
    });
  }

  get displayStatus(): NodeDisplayStatus {
    const node = this.node();
    if (!node) return 'offline';
    if (node.status === 'PENDING') return 'pending';
    if (node.status === 'REVOKED') return 'revoked';
    return node.online ? 'online' : 'offline';
  }

  onApprove(): void {
    if (this.nodeId) {
      this.gpuState.approveNode(this.nodeId);
    }
  }

  onRevoke(): void {
    if (this.nodeId && confirm('Revoke this node? Heartbeats will start returning 401.')) {
      this.gpuState.revokeNode(this.nodeId);
    }
  }

  onAdjustPower(): void {
    const watts = this.powerSetpoint();
    if (this.nodeId && watts && watts > 0) {
      this.gpuState.adjustPower(this.nodeId, watts);
      this.powerSetpoint.set(null);
    }
  }

  onRefresh(): void {
    this.gpuState.clearError();
    if (this.nodeId) {
      this.gpuState.loadNode(this.nodeId);
      this.gpuState.loadTelemetry(this.nodeId);
    }
  }
}
