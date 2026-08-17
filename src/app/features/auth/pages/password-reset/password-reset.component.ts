import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule],
  template: `<h1>Password Reset (Coming Soon)</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordResetComponent { }
