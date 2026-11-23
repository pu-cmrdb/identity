/**
 * 移除探索元資料中的 `registration_endpoint`
 *
 * 動態客戶端註冊已關閉（`allowDynamicClientRegistration: false`），
 * 但 `@better-auth/oauth-provider` 產生的元資料仍會宣告註冊端點，
 * 因此在回應前移除，避免客戶端誤以為可以自行註冊。
 *
 * @param metadata - 原始元資料
 * @returns 不含 `registration_endpoint` 的元資料
 */
export function stripRegistrationEndpoint<T extends Record<string, unknown>>(
  metadata: T,
): Omit<T, 'registration_endpoint'> {
  const { registration_endpoint: _, ...rest } = metadata;
  return rest;
}

/**
 * 包裝探索元資料的 route handler，回應前移除 `registration_endpoint`
 *
 * @param handler - `@better-auth/oauth-provider` 提供的 metadata handler
 * @returns 新的 route handler，狀態碼與標頭維持不變
 */
export function withoutRegistrationEndpoint(
  handler: (request: Request) => Promise<Response>,
) {
  return async (request: Request) => {
    const response = await handler(request);

    if (!response.ok) {
      return response;
    }

    const metadata = (await response.json()) as Record<string, unknown>;
    const headers = new Headers(response.headers);
    headers.delete('content-length');

    return Response.json(stripRegistrationEndpoint(metadata), {
      headers,
      status: response.status,
    });
  };
}
