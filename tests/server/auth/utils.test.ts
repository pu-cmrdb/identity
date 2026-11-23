import { describe, expect, test } from 'bun:test';

import { generatePassword, normalizeUsername } from '@/server/auth/utils';

describe('generatePassword', () => {
  test('產生 12 字元', () => {
    expect(generatePassword()).toHaveLength(12);
  });

  test('至少包含大寫、小寫、數字與特殊符號各一個', () => {
    for (let i = 0; i < 200; i++) {
      const password = generatePassword();

      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(/[^A-Za-z0-9]/);
    }
  });

  test('每次產生的密碼不同', () => {
    const passwords = new Set(Array.from({ length: 50 }, generatePassword));

    expect(passwords.size).toBe(50);
  });
});

describe('normalizeUsername', () => {
  test('轉為小寫並去除前後空白', () => {
    expect(normalizeUsername('  CmrdbAdmin  ')).toBe('cmrdbadmin');
  });

  test('非英數與底線的字元替換為底線', () => {
    expect(normalizeUsername('John Doe')).toBe('john_doe');
    expect(normalizeUsername('User@123!')).toBe('user_123_');
  });

  test('已標準化的名稱維持不變', () => {
    expect(normalizeUsername('cmrdb_admin_01')).toBe('cmrdb_admin_01');
  });
});
