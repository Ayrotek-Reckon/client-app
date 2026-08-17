import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EnergyCartService } from '../../energy/services/energy-cart.service';

/**
 * Guards for the mock checkout flow: prevent jumping straight to a
 * mid-flow URL without having gone through tier selection / checkout first.
 */
export const hasTierGuard: CanActivateFn = () => {
  const cart = inject(EnergyCartService);
  const router = inject(Router);
  return cart.selectedTier() ? true : router.createUrlTree(['/energy']);
};

export const hasOrderGuard: CanActivateFn = () => {
  const cart = inject(EnergyCartService);
  const router = inject(Router);
  return cart.lastOrder() ? true : router.createUrlTree(['/energy']);
};
