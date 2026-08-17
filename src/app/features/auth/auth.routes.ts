import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    data: { breadcrumb: 'Login' }
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    data: { breadcrumb: 'Register' }
  },
  {
    path: 'password-reset',
    loadComponent: () => import('./pages/password-reset/password-reset.component').then(m => m.PasswordResetComponent),
    data: { breadcrumb: 'Reset Password' }
  },
  {
    path: 'password-reset-confirm/:token',
    loadComponent: () => import('./pages/password-reset-confirm/password-reset-confirm.component').then(m => m.PasswordResetConfirmComponent),
    data: { breadcrumb: 'Confirm Password Reset' }
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
