import { describe, expect, test } from 'bun:test';

import {
  stripRegistrationEndpoint,
  withoutRegistrationEndpoint,
} from '@/server/auth/metadata';

const metadata = {
  authorization_endpoint: 'http://localhost:3000/api/auth/oauth2/authorize',
  issuer: 'http://localhost:3000/api/auth',
  registration_endpoint: 'http://localhost:3000/api/auth/oauth2/register',
  token_endpoint: 'http://localhost:3000/api/auth/oauth2/token',
};

describe('stripRegistrationEndpoint', () => {
  test('移除 registration_endpoint，保留其他欄位', () => {
    const result = stripRegistrationEndpoint(metadata);

    expect(result).not.toHaveProperty('registration_endpoint');
    expect(result).toEqual({
      authorization_endpoint: metadata.authorization_endpoint,
      issuer: metadata.issuer,
      token_endpoint: metadata.token_endpoint,
    });
  });
});

describe('withoutRegistrationEndpoint', () => {
  test('成功回應時移除 registration_endpoint，並保留狀態碼與標頭', async () => {
    const handler = withoutRegistrationEndpoint(async () =>
      Response.json(metadata, {
        headers: { 'cache-control': 'public, max-age=15' },
      }),
    );

    const response = await handler(new Request('http://localhost:3000'));
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=15');
    expect(body).not.toHaveProperty('registration_endpoint');
    expect(body.issuer).toBe(metadata.issuer);
  });

  test('錯誤回應原樣傳回', async () => {
    const handler = withoutRegistrationEndpoint(
      async () => new Response('not found', { status: 404 }),
    );

    const response = await handler(new Request('http://localhost:3000'));

    expect(response.status).toBe(404);
    expect(await response.text()).toBe('not found');
  });
});
