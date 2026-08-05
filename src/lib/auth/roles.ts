import type { UserRole } from '@/types';

export const ROLE_COOKIE = 'of_role';
export const ROLE_COOKIE_MAX_AGE = 60 * 60; // 1 hora

export type DashboardRole = Extract<UserRole, 'operador' | 'empresa' | 'admin'>;

/** Prefijos de ruta protegidos por rol */
export const ROLE_ROUTE_MAP: Record<string, DashboardRole[]> = {
  '/dashboard/operador': ['operador', 'admin'],
  '/dashboard/empresa': ['empresa', 'admin'],
  '/dashboard/admin': ['admin'],
};

export function dashboardPathForRole(role: string | null | undefined): string {
  switch (role) {
    case 'empresa':
      return '/dashboard/empresa';
    case 'admin':
      return '/dashboard/admin';
    case 'operador':
    default:
      return '/dashboard/operador';
  }
}

/**
 * Dado un pathname y un rol, decide si el acceso está permitido.
 * Rutas /dashboard genéricas requieren cualquier rol autenticado.
 */
export function canAccessPath(
  pathname: string,
  role: string | null | undefined
): boolean {
  if (!pathname.startsWith('/dashboard')) return true;
  if (!role) return false;

  for (const [prefix, allowed] of Object.entries(ROLE_ROUTE_MAP)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return allowed.includes(role as DashboardRole);
    }
  }

  // /dashboard sin subruta: cualquier rol válido
  return role === 'operador' || role === 'empresa' || role === 'admin';
}

export function isAuthRequiredPath(pathname: string): boolean {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/auth/setup-profile')
  );
}
