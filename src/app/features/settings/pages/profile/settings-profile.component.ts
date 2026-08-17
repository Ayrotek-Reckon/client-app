import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-settings-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-profile.component.html',
  styleUrls: ['./settings-profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsProfileComponent {
  user = this.authService.getCurrentUser();

  constructor(private authService: AuthService) { }

  getInitial(): string {
    return this.user?.username?.charAt(0)?.toUpperCase() || '?';
  }
}
