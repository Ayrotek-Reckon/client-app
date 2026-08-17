import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GpuStateService } from '../../services/gpu-state.service';
import { GpuDeviceCardComponent } from '../../components/gpu-device-card/gpu-device-card.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-gpu-list',
  standalone: true,
  imports: [CommonModule, RouterLink, GpuDeviceCardComponent, LoadingSpinnerComponent],
  templateUrl: './gpu-list.component.html',
  styleUrls: ['./gpu-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GpuListComponent implements OnInit {
  nodes = this.gpuState.nodes$;
  isLoading = this.gpuState.isLoading$;
  error = this.gpuState.error$;
  onlineCount = this.gpuState.onlineCount;
  offlineCount = this.gpuState.offlineCount;
  pendingCount = this.gpuState.pendingCount;
  revokedCount = this.gpuState.revokedCount;

  constructor(private gpuState: GpuStateService) { }

  ngOnInit(): void {
    this.gpuState.loadNodes();
  }

  onRefresh(): void {
    this.gpuState.clearError();
    this.gpuState.loadNodes();
  }

  onApprove(nodeId: string): void {
    this.gpuState.approveNode(nodeId);
  }

  onRevoke(nodeId: string): void {
    if (confirm('Are you sure you want to revoke this node? Its heartbeats will start returning 401.')) {
      this.gpuState.revokeNode(nodeId);
    }
  }
}
