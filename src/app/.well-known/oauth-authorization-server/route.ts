import { oauthProviderAuthServerMetadata } from '@better-auth/oauth-provider';

import { auth } from '@/server/auth';
import { withoutRegistrationEndpoint } from '@/server/auth/metadata';

/**
 * OAuth 2.1 Authorization Server Metadata Endpoint
 *
 * 提供 RFC8414 規範的 OAuth 授權伺服器元資料。
 * 此端點用於發現服務，允許客戶端自動取得授權伺服器的設定資訊。
 *
 * @see https://datatracker.ietf.org/doc/html/rfc8414
 *
 * ## CORS 設定
 *
 * 如果在本地測試時遇到 CORS 問題（如使用 MCP Inspector），
 * 可以暫時新增以下標頭用於測試：
 * - `Access-Control-Allow-Methods: GET`
 * - `Access-Control-Allow-Origin: *`
 *
 * 動態客戶端註冊已關閉，因此移除元資料中的 `registration_endpoint`。
 */
export const GET = withoutRegistrationEndpoint(
  oauthProviderAuthServerMetadata(auth),
);
