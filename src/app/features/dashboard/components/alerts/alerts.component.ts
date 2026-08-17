import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertItem } from '../../services/dashboard.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-surface alerts-container">
      <h3 class="alerts-title">Recent Alerts</h3>
      <div class="alerts-list">
        <div *ngIf="alerts.length === 0" class="empty-state">
          <span class="material-symbols-outlined empty-icon">notifications_off</span>
          <p>No alerts</p>
        </div>
        <div *ngFor="let alert of alerts" class="alert-item" [class]="'alert-' + alert.type">
          <span class="material-symbols-outlined alert-icon">{{ iconFor(alert.type) }}</span>
          <div class="alert-body">
            <div class="alert-header">
              <span class="alert-title">{{ alert.title }}</span>
              <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
            </div>
            <p class="alert-message">{{ alert.message }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .alerts-container {
      padding: var(--lumen-space-md);
    }

    .alerts-title {
      margin: 0 0 var(--lumen-space-md);
      font-size: 18px;
      font-weight: 600;
      color: var(--lumen-on-surface);
    }

    .alerts-list {
      max-height: 360px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--lumen-space-sm);
    }

    .empty-state {
      text-align: center;
      color: var(--lumen-on-surface-variant);
      padding: var(--lumen-space-xl) 0;
    }

    .empty-icon {
      font-size: 32px;
      opacity: 0.5;
      margin-bottom: var(--lumen-space-sm);
    }

    .alert-item {
      display: flex;
      gap: var(--lumen-space-sm);
      padding: var(--lumen-space-sm) var(--lumen-space-md);
      border-left: 3px solid;
      border-radius: var(--lumen-radius-sm);
      background: rgba(255, 255, 255, 0.02);
    }

    .alert-error {
      border-color: var(--lumen-error);
    }

    .alert-warning {
      border-color: var(--lumen-tertiary);
    }

    .alert-info {
      border-color: var(--lumen-primary);
    }

    .alert-icon {
      font-size: 18px;
      margin-top: 2px;
    }

    .alert-error .alert-icon { color: var(--lumen-error); }
    .alert-warning .alert-icon { color: var(--lumen-tertiary); }
    .alert-info .alert-icon { color: var(--lumen-primary); }

    .alert-body {
      flex: 1;
      min-width: 0;
    }

    .alert-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--lumen-space-sm);
    }

    .alert-title {
      font-weight: 600;
      font-size: 14px;
      color: var(--lumen-on-surface);
    }

    .alert-time {
      font-family: var(--lumen-font-mono);
      font-size: 11px;
      color: var(--lumen-on-surface-variant);
      white-space: nowrap;
    }

    .alert-message {
      margin: 2px 0 0;
      font-size: 13px;
      color: var(--lumen-on-surface-variant);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertsComponent {
  @Input() alerts: AlertItem[] = [];

  iconFor(type: string): string {
    if (type === 'error') return 'error';
    if (type === 'warning') return 'warning';
    return 'info';
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  }
}
