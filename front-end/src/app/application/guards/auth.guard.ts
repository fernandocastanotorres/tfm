import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional route guard that verifies JWT validity before allowing navigation.
 * Redirects to /login if the token is missing, expired, or invalid.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Token is missing or expired — redirect to login
  return router.createUrlTree(['/sede/login'], {
    queryParams: { returnUrl: state.url }
  });
};
