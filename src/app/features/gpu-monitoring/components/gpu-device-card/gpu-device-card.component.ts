import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Node } from '../../models/gpu.model';
import { GpuStatusBadgeComponent, NodeDisplayStatus } from '../gpu-status-badge/gpu-status-badge.component';

@Component({
  selector: 'app-gpu-device-card',
  standalone: true,
  imports: [CommonModule, RouterLink, GpuStatusBadgeComponent],
  template: `
    <div class="device-card">
      <div class="card-header">
        <h3>{{ node.hardwareId }}</h3>
        <app-gpu-status-badge [status]="displayStatus"></app-gpu-status-badge>
      </div>

      <div class="card-body">
        <div class="info-row">
          <span class="label">Model:</span>
          <span class="value">{{ node.model || 'Unknown' }}</span>
        </div>
        <div class="info-row">
          <span class="label">Firmware:</span>
          <span class="value">{{ node.fwVersion || 'N/A' }}</span>
        </div>
        <div class="info-row">
          <span class="label">GPUs:</span>
          <span class="value">{{ node.gpus.length }}</span>
        </div>
        <div class="info-row">
          <span class="label">Power Range:</span>
          <span class="value">{{ node.minPowerW ?? '?' }}W – {{ node.maxPowerW ?? '?' }}W</span>
        </div>
        <div class="info-row">
          <span class="label">Last Heartbeat:</span>
          <span class="value">{{ formatTime(node.lastHeartbeatAt) }}</span>
        </div>
      </div>

      <div class="card-footer">
        <a [routerLink]="['/gpu-monitoring', node.id]" class="btn-view">View Details →</a>
      </div>
    </div>
  `,
  styles: [`
    .device-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .device-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      background: #f9f9f9;
      padding: 1rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-header h3 {
      margin: 0;
      color: #333;
      font-size: 15px;
      font-family: monospace;
    }

    .card-body {
      padding: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-row:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .label {
      font-weight: 600;
      color: #666;
      font-size: 13px;
    }

    .value {
      color: #333;
      font-size: 13px;
    }

    .card-footer {
      padding: 1rem;
      border-top: 1px solid #eee;
      background: #fafafa;
    }

    .btn-view {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }

    .btn-view:hover {
      color: #764ba2;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GpuDeviceCardComponent {
  @Input() node!: Node;
  @Output() approve = new EventEmitter<void>();
  @Output() revoke = new EventEmitter<void>();

  get displayStatus(): NodeDisplayStatus {
    if (this.node.status === 'PENDING') return 'pending';
    if (this.node.status === 'REVOKED') return 'revoked';
    return this.node.online ? 'online' : 'offline';
  }

  formatTime(timestamp: string | null): string {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  }
}
