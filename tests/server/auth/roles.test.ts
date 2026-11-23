import { describe, expect, test } from 'bun:test';

import { hasRole } from '@/server/auth/utils';

describe('hasRole', () => {
  test('單一角色', () => {
    expect(hasRole('admin', 'admin')).toBe(true);
    expect(hasRole('user', 'admin')).toBe(false);
  });

  test('逗號分隔的多角色（含空白）', () => {
    expect(hasRole('user,admin', 'admin')).toBe(true);
    expect(hasRole('user, admin', 'admin')).toBe(true);
    expect(hasRole('user, editor', 'admin')).toBe(false);
  });

  test('不接受部分字串比對', () => {
    expect(hasRole('superadmin', 'admin')).toBe(false);
    expect(hasRole('admins', 'admin')).toBe(false);
  });

  test('沒有角色時回傳 false', () => {
    expect(hasRole(null, 'admin')).toBe(false);
    expect(hasRole(undefined, 'admin')).toBe(false);
    expect(hasRole('', 'admin')).toBe(false);
  });
});
