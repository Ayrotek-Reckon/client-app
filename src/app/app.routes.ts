import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent),
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
    data: { layout: 'auth' }
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { breadcrumb: 'Dashboard', roles: [] }
      },
      {
        path: 'energy',
        loadComponent: () => import('./features/energy/pages/marketplace/energy-marketplace.component').then(m => m.EnergyMarketplaceComponent),
        data: { breadcrumb: 'Energy' }
      },
      {
        path: 'payments',
        loadChildren: () => import('./features/payments/payments.routes').then(m => m.PAYMENTS_ROUTES),
        data: { breadcrumb: 'Payments' }
      },
      {
        path: 'mining',
        loadComponent: () => import('./features/hiveos/pages/mining-strategy/mining-strategy.component').then(m => m.MiningStrategyComponent),
        data: { breadcrumb: 'Mining Strategy' }
      },
      {
        path: 'gpu-monitoring',
        loadComponent: () => import('./features/gpu-monitoring/gpu-monitoring.component').then(m => m.GpuMonitoringComponent),
        loadChildren: () => import('./features/gpu-monitoring/gpu-monitoring.routes').then(m => m.GPU_MONITORING_ROUTES),
        data: { breadcrumb: 'GPU Monitoring', roles: ['ADMIN', 'OPERATOR'] },
        canActivate: [roleGuard]
      },
      {
        path: 'wallet',
        loadComponent: () => import('./features/hiveos/pages/wallets/hiveos-wallets.component').then(m => m.HiveOSWalletsComponent),
        data: { breadcrumb: 'Wallet' }
      },
      {
        path: 'history',
        loadComponent: () => import('./features/history/pages/transaction-history/transaction-history.component').then(m => m.TransactionHistoryComponent),
        data: { breadcrumb: 'History' }
      },
      {
        path: 'users',
        loadComponent: () => import('./features/user-management/user-management.component').then(m => m.UserManagementComponent),
        loadChildren: () => import('./features/user-management/user-management.routes').then(m => m.USER_MANAGEMENT_ROUTES),
        data: { breadcrumb: 'Users', roles: ['ADMIN'] },
        canActivate: [roleGuard]
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
        loadChildren: () => import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
        data: { breadcrumb: 'Settings' }
      },
      {
        path: 'hiveos',
        loadComponent: () => import('./features/hiveos/hiveos.component').then(m => m.HiveOSComponent),
        loadChildren: () => import('./features/hiveos/hiveos.routes').then(m => m.HIVEOS_ROUTES),
        data: { breadcrumb: 'HiveOS', roles: ['ADMIN', 'OPERATOR'] },
        canActivate: [roleGuard]
      },
      {
        path: 'help-support',
        loadComponent: () => import('./features/help-support/help-support.component').then(m => m.HelpSupportComponent),
        data: { breadcrumb: 'Help & Support' }
      }
    ]
  },
  {
    path: '403',
    loadComponent: () => import('./core/error/error-page.component').then(m => m.ErrorPageComponent),
    data: { errorCode: 403 }
  },
  {
    path: '404',
    loadComponent: () => import('./core/error/error-page.component').then(m => m.ErrorPageComponent),
    data: { errorCode: 404 }
  },
  {
    path: '500',
    loadComponent: () => import('./core/error/error-page.component').then(m => m.ErrorPageComponent),
    data: { errorCode: 500 }
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];
