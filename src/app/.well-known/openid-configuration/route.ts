import { oauthProviderOpenIdConfigMetadata } from '@better-auth/oauth-provider';

import { auth } from '@/server/auth';

/**
 * OpenID Connect Discovery Metadata Endpoint
 *
 * 提供 OIDC 規範的身份提供者發現元資料。
 * 此端點用於 OpenID Connect 發現服務，允許客戶端自動取得
 * 身份提供者的設定資訊。
 *
 * @see https://openid.net/specs/openid-connect-discovery-1_0.html
 *
 * ## 需求
 *
 * 此端點需要 `openid` scope 才會啟用。
 *
 * ## CORS 設定
 *
 * 如果在本地測試時遇到 CORS 問題（如使用 MCP Inspector），
 * 可以暫時新增以下標頭用於測試：
 * - `Access-Control-Allow-Methods: GET`
 * - `Access-Control-Allow-Origin: *`
 */
export const GET = oauthProviderOpenIdConfigMetadata(auth);
