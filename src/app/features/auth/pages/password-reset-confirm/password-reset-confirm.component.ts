import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-reset-confirm',
  standalone: true,
  imports: [CommonModule],
  template: `<h1>Confirm Password Reset (Coming Soon)</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordResetConfirmComponent { }
