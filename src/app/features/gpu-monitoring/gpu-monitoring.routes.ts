import { Routes } from '@angular/router';

export const GPU_MONITORING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/gpu-list/gpu-list.component').then(m => m.GpuListComponent),
    data: { breadcrumb: 'GPU List' }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/gpu-detail/gpu-detail.component').then(m => m.GpuDetailComponent),
    data: { breadcrumb: 'GPU Detail' }
  }
];
