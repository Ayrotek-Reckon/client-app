import { Routes } from '@angular/router';

export const HIVEOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/farms/hiveos-farms.component').then(m => m.HiveOSFarmsComponent),
    data: { breadcrumb: 'Farms' }
  },
  {
    path: 'farms/:farmId/workers',
    loadComponent: () => import('./pages/workers/hiveos-workers.component').then(m => m.HiveOSWorkersComponent),
    data: { breadcrumb: 'Workers' }
  }
];
