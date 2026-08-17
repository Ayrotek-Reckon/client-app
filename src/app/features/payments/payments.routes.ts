import { Routes } from '@angular/router';
import { hasTierGuard, hasOrderGuard } from './guards/payment-flow.guards';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: 'select',
    loadComponent: () => import('./pages/select-payment/select-payment.component').then(m => m.SelectPaymentComponent),
    canActivate: [hasTierGuard],
    data: { breadcrumb: 'Select Payment' }
  },
  {
    path: 'review',
    loadComponent: () => import('./pages/review-order/review-order.component').then(m => m.ReviewOrderComponent),
    canActivate: [hasTierGuard],
    data: { breadcrumb: 'Review Order' }
  },
  {
    path: 'success',
    loadComponent: () => import('./pages/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent),
    canActivate: [hasOrderGuard],
    data: { breadcrumb: 'Payment Success' }
  },
  {
    path: 'withdraw',
    loadComponent: () => import('./pages/withdraw-funds/withdraw-funds.component').then(m => m.WithdrawFundsComponent),
    data: { breadcrumb: 'Withdraw Funds' }
  },
  {
    path: '',
    redirectTo: 'withdraw',
    pathMatch: 'full'
  }
];
