import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: 'general',
    loadComponent: () => import('./pages/general/settings-general.component').then(m => m.SettingsGeneralComponent),
    data: { breadcrumb: 'General' }
  },
  {
    path: 'security',
    loadComponent: () => import('./pages/security/settings-security.component').then(m => m.SettingsSecurityComponent),
    data: { breadcrumb: 'Security' }
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/settings-profile.component').then(m => m.SettingsProfileComponent),
    data: { breadcrumb: 'Profile' }
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/settings-notifications.component').then(m => m.SettingsNotificationsComponent),
    data: { breadcrumb: 'Notifications' }
  },
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full'
  }
];
