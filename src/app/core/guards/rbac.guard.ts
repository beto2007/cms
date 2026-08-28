import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RbacService } from '../services/rbac.service';
import { AuthService } from '../services/auth.service';

/**
  * Guard to verify if current user role has access to the target route according to dynamic Firestore RBAC config.
  */
export const rbacGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const rbacService = inject(RbacService);
  const router = inject(Router);

  // Esperar a que Firebase Auth esté listo
  const user = await authService.authStateReady();
  if (!user) {
    return router.createUrlTree(['/login']);
  }

  // Asegurar que el rol del usuario esté cargado desde Firestore
  await rbacService.loadUserRole(user.uid);
  await rbacService.loadRolesConfig();

  const targetPath = state.url.split('?')[0];

  if (rbacService.hasRouteAccess(targetPath)) {
    return true;
  }

  // Si no tiene acceso, redirigir a /unauthorized o /
  return router.createUrlTree(['/unauthorized']);
};
