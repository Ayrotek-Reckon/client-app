import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {
  user = this.authService.getCurrentUser();
  isAdmin = this.authService.hasRole('ADMIN');
  isOperator = this.authService.hasAnyRole(['ADMIN', 'OPERATOR']);

  mobileNavOpen = signal(false);
  profileMenuOpen = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  toggleMobileNav(): void {
    this.mobileNavOpen.update(v => !v);
  }

  closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getInitial(): string {
    return this.user?.username?.charAt(0)?.toUpperCase() || '?';
  }
}
