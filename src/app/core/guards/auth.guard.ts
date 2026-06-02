import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  const token = authService.getToken();
  if (token) {
    localStorage.setItem('session_expired', 'true');
  }

  authService.logout();
  router.navigate(['/auth/login']);
  return false;
};