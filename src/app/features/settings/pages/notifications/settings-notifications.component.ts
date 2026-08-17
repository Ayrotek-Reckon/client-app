import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AlertRow {
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  locked?: boolean;
}

interface AlertSection {
  icon: string;
  title: string;
  accent: 'primary' | 'secondary' | 'error';
  rows: AlertRow[];
}

/**
 * There is no notification-preferences endpoint on the backend.
 * All toggles are local component state; "Save Preferences" does not
 * persist anywhere and resets on reload.
 */
@Component({
  selector: 'app-settings-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-notifications.component.html',
  styleUrls: ['./settings-notifications.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsNotificationsComponent {
  sections = signal<AlertSection[]>([
    {
      icon: 'memory',
      title: 'Mining Alerts',
      accent: 'primary',
      rows: [
        { title: 'Rig Status Changes', description: 'Get notified when a mining rig starts, stops, or goes offline', email: true, push: true, sms: false },
        { title: 'Low Energy Supply', description: 'Alerts when GPU energy drops below 15%', email: true, push: true, sms: true }
      ]
    },
    {
      icon: 'payments',
      title: 'Financial Alerts',
      accent: 'secondary',
      rows: [
        { title: 'Payments Received', description: 'Notifications for successful marketplace settlements', email: true, push: true, sms: false },
        { title: 'Withdrawals Completed', description: 'Confirmations for crypto/fiat withdrawals', email: true, push: true, sms: true }
      ]
    },
    {
      icon: 'security',
      title: 'Security Alerts',
      accent: 'error',
      rows: [
        { title: 'New Device Login', description: 'Alerts for new IP/device access', email: true, push: true, sms: true, locked: true },
        { title: '2FA & Password Changes', description: 'Alerts for account setting modifications', email: true, push: true, sms: true, locked: true }
      ]
    }
  ]);

  saved = signal(false);

  toggle(sectionIndex: number, rowIndex: number, channel: 'email' | 'push' | 'sms'): void {
    const row = this.sections()[sectionIndex].rows[rowIndex];
    if (row.locked && (channel === 'email' || channel === 'push')) return;

    this.sections.update(sections => {
      const next = sections.map(s => ({ ...s, rows: s.rows.map(r => ({ ...r })) }));
      next[sectionIndex].rows[rowIndex][channel] = !next[sectionIndex].rows[rowIndex][channel];
      return next;
    });
    this.saved.set(false);
  }

  save(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }
}
