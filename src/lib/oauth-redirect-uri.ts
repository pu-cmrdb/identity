export type OAuthApplicationType = 'web' | 'native';

const LOOPBACK_AUTHORITIES = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;
const REVERSE_DOMAIN_SCHEME = /^[a-z][a-z0-9-]*(?:\.[a-z0-9][a-z0-9-]*)+$/i;
const RESERVED_SCHEMES = new Set([
  'data:',
  'file:',
  'javascript:',
  'mailto:',
  'vbscript:',
]);

function rawAuthority(uri: string) {
  return uri.match(/^[a-z][a-z0-9+.-]*:\/\/([^/?#]*)/i)?.[1] ?? null;
}

function isExactLoopback(uri: string) {
  const authority = rawAuthority(uri);
  if (!authority || authority.includes('@')) {
    return false;
  }
  return LOOPBACK_AUTHORITIES.test(authority);
}

export function validateOAuthRedirectUri(
  value: string,
  applicationType: OAuthApplicationType,
) {
  const uri = value.trim();
  if (!uri) {
    return '重新導向 URI 不可為空白';
  }

  let parsed: URL;
  try {
    parsed = new URL(uri);
  } catch {
    return '請輸入有效的完整 URI';
  }

  if (parsed.username || parsed.password) {
    return '重新導向 URI 不可包含帳號或密碼';
  }
  if (parsed.hash) {
    return '重新導向 URI 不可包含片段（#）';
  }
  if (RESERVED_SCHEMES.has(parsed.protocol)) {
    return `不支援 ${parsed.protocol} URI`;
  }

  const isLoopback = isExactLoopback(uri);
  const normalizesToLoopback =
    parsed.hostname === 'localhost'
    || parsed.hostname === '127.0.0.1'
    || parsed.hostname === '[::1]'
    || parsed.hostname.endsWith('.localhost');
  if (normalizesToLoopback && !isLoopback) {
    return 'Loopback host 必須完整使用 localhost、127.0.0.1 或 [::1]';
  }

  if (parsed.protocol === 'http:') {
    return isLoopback
      ? null
      : 'HTTP 僅允許 localhost、127.0.0.1 或 [::1] 回呼網址';
  }

  if (parsed.protocol === 'https:') {
    return isLoopback ? 'Loopback 回呼網址必須使用 HTTP' : null;
  }

  if (applicationType === 'web') {
    return 'Web 應用程式必須使用 HTTPS，或 HTTP loopback URI';
  }

  const scheme = parsed.protocol.slice(0, -1);
  const afterScheme = uri.slice(parsed.protocol.length);
  if (afterScheme.startsWith('//')) {
    return '自訂 scheme 必須是不含 authority 的 URI';
  }
  if (!REVERSE_DOMAIN_SCHEME.test(scheme)) {
    return 'Deep link 必須使用反向網域 scheme，例如 com.example.app:/callback';
  }

  return null;
}
