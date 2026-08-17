import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NodeDisplayStatus = 'online' | 'offline' | 'pending' | 'revoked';

@Component({
  selector: 'app-gpu-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [class]="'status-' + status">
      {{ statusLabel }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-online {
      background: #d4edda;
      color: #155724;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-revoked {
      background: #f8d7da;
      color: #721c24;
    }

    .status-offline {
      background: #e2e3e5;
      color: #383d41;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GpuStatusBadgeComponent {
  @Input() status: NodeDisplayStatus = 'offline';

  get statusLabel(): string {
    return this.status.charAt(0).toUpperCase() + this.status.slice(1);
  }
}
