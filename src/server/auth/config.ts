import { admin, jwt, openAPI, username } from 'better-auth/plugins';
import { apiKey } from '@better-auth/api-key';
import { auditLog } from 'better-auth-audit-logs';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { oauthProvider } from '@better-auth/oauth-provider';
import { passkey } from '@better-auth/passkey';

import { db } from '@/server/database';
import { env } from '@/env';

import { ac, roles } from './access';
import { normalizeUsername } from './utils';

export const auth = betterAuth({
  account: {
    accountLinking: {
      allowDifferentEmails: true,
    },
  },
  appName: '行雲身分管理系統',
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    usePlural: true,
  }),
  emailAndPassword: {
    disableSignUp: true,
    enabled: true,
  },
  plugins: [
    admin({
      ac,
      roles,
    }),
    auditLog(),
    oauthProvider({
      allowDynamicClientRegistration: true,
      consentPage: '/oauth2/authorize',
      loginPage: '/login',
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      silenceWarnings: {
        oauthAuthServerConfig: true,
      },
    }),
    username({
      usernameNormalization: normalizeUsername,
    }),
    apiKey({
      defaultPrefix: 'cmrdb_',
      enableSessionForAPIKeys: true,
      rateLimit: {
        enabled: true,
        maxRequests: 1000,
        timeWindow: 1000 * 60 * 60, // 1 hour
      },
    }),
    passkey(),
    jwt(),
    openAPI({
      path: '/reference',
      theme: 'alternate',
    }),
  ],
  socialProviders: {
    discord: {
      clientId: env.BETTER_AUTH_DISCORD_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_DISCORD_CLIENT_SECRET,
    },
  },
  trustedOrigins: ['http://localhost:*', 'https://*.cmrdb.cs.pu.edu.tw'],
  user: {
    additionalFields: {
      displayUsername: {
        required: false,
        type: 'string',
      },
      role: {
        required: false,
        type: 'string',
      },
      username: {
        required: false,
        type: 'string',
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
