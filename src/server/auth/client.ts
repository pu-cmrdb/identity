import {
  adminClient,
  jwtClient,
  usernameClient,
} from 'better-auth/client/plugins';
import { apiKeyClient } from '@better-auth/api-key/client';
import { auditLogClient } from 'better-auth-audit-logs/client';
import { createAuthClient } from 'better-auth/react';
import { oauthProviderClient } from '@better-auth/oauth-provider/client';
import { passkeyClient } from '@better-auth/passkey/client';

export const authClient = createAuthClient({
  plugins: [
    apiKeyClient(),
    auditLogClient(),
    adminClient(),
    jwtClient(),
    oauthProviderClient(),
    passkeyClient(),
    usernameClient(),
  ],
});

export type Session = typeof authClient.$Infer.Session;
