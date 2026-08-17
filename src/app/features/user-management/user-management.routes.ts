import { Routes } from '@angular/router';

export const USER_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/user-list/user-list.component').then(m => m.UserListComponent),
    data: { breadcrumb: 'Users List' }
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/user-form/user-form.component').then(m => m.UserFormComponent),
    data: { breadcrumb: 'Create User' }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/user-detail/user-detail.component').then(m => m.UserDetailComponent),
    data: { breadcrumb: 'Edit User' }
  }
];
