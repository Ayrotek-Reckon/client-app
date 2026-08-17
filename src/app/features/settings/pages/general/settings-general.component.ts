import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings-general',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-page">
      <h3>General Settings</h3>
      <p class="hint">Not available yet — there is no user-preferences endpoint on the backend.</p>
      <button class="btn-primary" disabled>Save Settings</button>
    </div>
  `,
  styles: [`
    .settings-page { padding: 1rem 0; }
    .hint { color: #7f8c8d; font-size: 13px; margin-bottom: 1.5rem; }
    .btn-primary { background: #95a5a6; color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 4px; cursor: not-allowed; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsGeneralComponent { }
