import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Get required roles from route data
  const requiredRoles = route.data['roles'] as string[];

  // If no specific roles required, allow access
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Check if user has any of the required roles
  if (authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  // User doesn't have required roles
  router.navigate(['/403']);
  return false;
};

// Alternative: Check for a single role
export const hasRoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const requiredRole = route.data['role'] as string;

  if (requiredRole && !authService.hasRole(requiredRole)) {
    router.navigate(['/403']);
    return false;
  }

  return true;
};

// Guard for admin-only routes
export const adminGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (!authService.hasRole('ADMIN')) {
    router.navigate(['/403']);
    return false;
  }

  return true;
};
