import { describe, it, expect } from 'vitest';
import { permissionForPath, firstAllowedAdminPath, hasPermission } from './adminNav';

describe('admin navigation permissions', () => {
  it('uses the most specific page for a path', () => {
    expect(permissionForPath('/admin/finance/top-ups')).toBe('finance.view');
    expect(permissionForPath('/admin/settings/permissions')).toBe('roles.manage');
    expect(permissionForPath('/admin/settings')).toBe('settings.manage');
    expect(permissionForPath('/admin/students/create')).toBe('students.manage');
    expect(permissionForPath('/admin/students')).toBe('students.view');
    expect(permissionForPath('/admin')).toBe('dashboard.view');
  });

  it('accepts any one of several permissions', () => {
    expect(hasPermission(['fees.view'], ['fees.view', 'reports.view'])).toBe(true);
    expect(hasPermission(['students.view'], ['fees.view', 'reports.view'])).toBe(false);
  });

  it('sends a limited role to its first allowed page', () => {
    expect(firstAllowedAdminPath(['dashboard.view'])).toBe('/admin');
    expect(firstAllowedAdminPath(['fees.view'])).toBe('/admin/fees');
    expect(firstAllowedAdminPath([])).toBeNull();
  });
});
