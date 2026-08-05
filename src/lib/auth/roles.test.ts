import { describe, it, expect } from 'vitest';
import {
  canAccessPath,
  dashboardPathForRole,
  isAuthRequiredPath,
} from './roles';

describe('canAccessPath', () => {
  it('permite operador en su dashboard', () => {
    expect(canAccessPath('/dashboard/operador', 'operador')).toBe(true);
  });

  it('bloquea operador en dashboard empresa', () => {
    expect(canAccessPath('/dashboard/empresa', 'operador')).toBe(false);
  });

  it('permite admin en ambos', () => {
    expect(canAccessPath('/dashboard/empresa', 'admin')).toBe(true);
    expect(canAccessPath('/dashboard/operador', 'admin')).toBe(true);
  });

  it('bloquea sin rol', () => {
    expect(canAccessPath('/dashboard/operador', null)).toBe(false);
  });
});

describe('dashboardPathForRole', () => {
  it('mapea roles', () => {
    expect(dashboardPathForRole('empresa')).toBe('/dashboard/empresa');
    expect(dashboardPathForRole('operador')).toBe('/dashboard/operador');
    expect(dashboardPathForRole('admin')).toBe('/dashboard/admin');
  });
});

describe('isAuthRequiredPath', () => {
  it('detecta rutas protegidas', () => {
    expect(isAuthRequiredPath('/dashboard/empresa')).toBe(true);
    expect(isAuthRequiredPath('/auth/setup-profile')).toBe(true);
    expect(isAuthRequiredPath('/vacantes')).toBe(false);
  });
});
