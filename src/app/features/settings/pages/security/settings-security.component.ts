import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GpuMonitoringService } from '../../../gpu-monitoring/services/gpu-monitoring.service';
import { Node } from '../../../gpu-monitoring/models/gpu.model';

type OtpStep = 'idle' | 'qr' | 'code' | 'enabled';

@Component({
  selector: 'app-settings-security',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-security.component.html',
  styleUrls: ['./settings-security.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsSecurityComponent implements OnInit {
  /**
   * 2FA setup is a UI-only simulation — auth-service has no 2FA/OTP endpoint.
   * This state lives only in the component and resets on reload.
   */
  otpStep = signal<OtpStep>('idle');
  otpCode = signal('');
  otpError = signal<string | null>(null);
  mockSecret = 'JBSW Y3DP EHPK 3PXP';

  nodes = signal<Node[]>([]);
  nodesLoading = signal(false);

  constructor(private gpuService: GpuMonitoringService) { }

  ngOnInit(): void {
    this.nodesLoading.set(true);
    this.gpuService.getNodes().subscribe({
      next: (nodes) => {
        this.nodes.set(nodes);
        this.nodesLoading.set(false);
      },
      error: () => this.nodesLoading.set(false)
    });
  }

  startEnable2fa(): void {
    this.otpStep.set('qr');
    this.otpError.set(null);
    this.otpCode.set('');
  }

  goToCodeStep(): void {
    this.otpStep.set('code');
  }

  verifyCode(): void {
    const code = this.otpCode().trim();
    if (!/^\d{6}$/.test(code)) {
      this.otpError.set('Enter the 6-digit code from your authenticator app.');
      return;
    }
    this.otpError.set(null);
    this.otpStep.set('enabled');
  }

  cancelSetup(): void {
    this.otpStep.set('idle');
    this.otpCode.set('');
    this.otpError.set(null);
  }

  disable2fa(): void {
    if (confirm('Disable two-factor authentication?')) {
      this.otpStep.set('idle');
    }
  }
}
