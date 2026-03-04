/**
 * 隨機產生一組安全的密碼
 *
 * 產生一組 12 字元的密碼，包含至少一個大寫字母、一個小寫字母、
 * 一個數字以及一個 OWASP 定義的特殊符號。
 *
 * @returns 12 字元的安全密碼
 *
 * @example
 * ```typescript
 * const password = generatePassword();
 * // 可能輸出: "aB3!xY7zK@mN"
 * ```
 */
export function generatePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

  const allChars = uppercase + lowercase + numbers + specialChars;

  const password: string[] = [
    uppercase.charAt(~~(Math.random() * uppercase.length)),
    lowercase.charAt(~~(Math.random() * lowercase.length)),
    numbers.charAt(~~(Math.random() * numbers.length)),
    specialChars.charAt(~~(Math.random() * specialChars.length)),
  ];

  for (let i = 0; i < 8; i++) {
    password.push(allChars.charAt(~~(Math.random() * allChars.length)));
  }

  for (let i = password.length - 1; i > 0; i--) {
    const j = ~~(Math.random() * (i + 1));
    const charI = password[i];
    const charJ = password[j];

    if (charI !== undefined && charJ !== undefined) {
      password[i] = charJ;
      password[j] = charI;
    }
  }

  return password.join('');
}

/**
 * 標準化使用者名稱格式
 *
 * 將使用者名稱轉換為統一的標準格式,僅保留小寫英文字母、數字與底線,
 * 並將其他字元替換為底線。
 *
 * @param username - 原始使用者名稱
 * @returns 標準化後的使用者名稱
 *
 * @example
 * ```typescript
 * const normalized = normalizeUsername("John Doe");
 * // 輸出: "john_doe"
 *
 * const normalized2 = normalizeUsername("User@123!");
 * // 輸出: "user123"
 * ```
 */
export function normalizeUsername(username: string): string {
  return username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
}
