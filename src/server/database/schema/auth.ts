import { relations } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  banExpires: integer('ban_expires', { mode: 'timestamp_ms' }),
  banned: integer('banned', { mode: 'boolean' }).default(false),
  banReason: text('ban_reason'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  displayUsername: text('display_username'),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .default(false)
    .notNull(),
  id: text('id').primaryKey(),
  image: text('image'),
  name: text('name').notNull(),
  role: text('role'),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .$onUpdate(() => new Date())
    .notNull(),
  username: text('username'),
});

export const sessions = sqliteTable(
  'sessions',
  {
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    id: text('id').primaryKey(),
    impersonatedBy: text('impersonated_by'),
    ipAddress: text('ip_address'),
    token: text('token').notNull().unique(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [index('sessions_userId_idx').on(table.userId)],
);

export const accounts = sqliteTable(
  'accounts',
  {
    accessToken: text('access_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', {
      mode: 'timestamp_ms',
    }),
    accountId: text('account_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    id: text('id').primaryKey(),
    idToken: text('id_token'),
    password: text('password'),
    providerId: text('provider_id').notNull(),
    refreshToken: text('refresh_token'),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', {
      mode: 'timestamp_ms',
    }),
    scope: text('scope'),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [index('accounts_userId_idx').on(table.userId)],
);

export const verifications = sqliteTable(
  'verifications',
  {
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
    value: text('value').notNull(),
  },
  (table) => [index('verifications_identifier_idx').on(table.identifier)],
);

export const audit_logs = sqliteTable(
  'audit_logs',
  {
    action: text('action').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    id: text('id').primaryKey(),
    ipAddress: text('ip_address'),
    metadata: text('metadata'),
    severity: text('severity').notNull(),
    status: text('status').notNull(),
    userAgent: text('user_agent'),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
  },
  (table) => [
    index('audit_logs_userId_idx').on(table.userId),
    index('audit_logs_action_idx').on(table.action),
    index('audit_logs_createdAt_idx').on(table.createdAt),
  ],
);

export const oauthClients = sqliteTable('oauth_clients', {
  clientId: text('client_id').notNull().unique(),
  clientSecret: text('client_secret'),
  contacts: text('contacts', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }),
  disabled: integer('disabled', { mode: 'boolean' }).default(false),
  enableEndSession: integer('enable_end_session', { mode: 'boolean' }),
  grantTypes: text('grant_types', { mode: 'json' }),
  icon: text('icon'),
  id: text('id').primaryKey(),
  metadata: text('metadata', { mode: 'json' }),
  name: text('name'),
  policy: text('policy'),
  postLogoutRedirectUris: text('post_logout_redirect_uris', { mode: 'json' }),
  public: integer('public', { mode: 'boolean' }),
  redirectUris: text('redirect_uris', { mode: 'json' }).notNull(),
  referenceId: text('reference_id'),
  requirePKCE: integer('require_pkce', { mode: 'boolean' }),
  responseTypes: text('response_types', { mode: 'json' }),
  scopes: text('scopes', { mode: 'json' }),
  skipConsent: integer('skip_consent', { mode: 'boolean' }),
  softwareId: text('software_id'),
  softwareStatement: text('software_statement'),
  softwareVersion: text('software_version'),
  subjectType: text('subject_type'),
  tokenEndpointAuthMethod: text('token_endpoint_auth_method'),
  tos: text('tos'),
  type: text('type'),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
  uri: text('uri'),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
});

export const oauthRefreshTokens = sqliteTable('oauth_refresh_tokens', {
  authTime: integer('auth_time', { mode: 'timestamp_ms' }),
  clientId: text('client_id')
    .notNull()
    .references(() => oauthClients.clientId, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  id: text('id').primaryKey(),
  referenceId: text('reference_id'),
  revoked: integer('revoked', { mode: 'timestamp_ms' }),
  scopes: text('scopes', { mode: 'json' }).notNull(),
  sessionId: text('session_id').references(() => sessions.id, {
    onDelete: 'set null',
  }),
  token: text('token').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const oauthAccessTokens = sqliteTable('oauth_access_tokens', {
  clientId: text('client_id')
    .notNull()
    .references(() => oauthClients.clientId, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  id: text('id').primaryKey(),
  referenceId: text('reference_id'),
  refreshId: text('refresh_id').references(() => oauthRefreshTokens.id, {
    onDelete: 'cascade',
  }),
  scopes: text('scopes', { mode: 'json' }).notNull(),
  sessionId: text('session_id').references(() => sessions.id, {
    onDelete: 'set null',
  }),
  token: text('token').notNull().unique(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
});

export const oauthConsents = sqliteTable('oauth_consents', {
  clientId: text('client_id')
    .notNull()
    .references(() => oauthClients.clientId, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  id: text('id').primaryKey(),
  referenceId: text('reference_id'),
  scopes: text('scopes', { mode: 'json' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
});

export const apikeys = sqliteTable(
  'apikeys',
  {
    configId: text('config_id').default('default').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    enabled: integer('enabled', { mode: 'boolean' }).default(true),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }),
    id: text('id').primaryKey(),
    key: text('key').notNull(),
    lastRefillAt: integer('last_refill_at', { mode: 'timestamp_ms' }),
    lastRequest: integer('last_request', { mode: 'timestamp_ms' }),
    metadata: text('metadata'),
    name: text('name'),
    permissions: text('permissions'),
    prefix: text('prefix'),
    rateLimitEnabled: integer('rate_limit_enabled', {
      mode: 'boolean',
    }).default(true),
    rateLimitMax: integer('rate_limit_max').default(1000),
    rateLimitTimeWindow: integer('rate_limit_time_window').default(3600000),
    referenceId: text('reference_id').notNull(),
    refillAmount: integer('refill_amount'),
    refillInterval: integer('refill_interval'),
    remaining: integer('remaining'),
    requestCount: integer('request_count').default(0),
    start: text('start'),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('apikeys_configId_idx').on(table.configId),
    index('apikeys_referenceId_idx').on(table.referenceId),
    index('apikeys_key_idx').on(table.key),
  ],
);

export const passkeys = sqliteTable(
  'passkeys',
  {
    aaguid: text('aaguid'),
    backedUp: integer('backed_up', { mode: 'boolean' }).notNull(),
    counter: integer('counter').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }),
    credentialID: text('credential_id').notNull(),
    deviceType: text('device_type').notNull(),
    id: text('id').primaryKey(),
    name: text('name'),
    publicKey: text('public_key').notNull(),
    transports: text('transports'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('passkeys_userId_idx').on(table.userId),
    index('passkeys_credentialID_idx').on(table.credentialID),
  ],
);

export const jwkss = sqliteTable('jwkss', {
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }),
  id: text('id').primaryKey(),
  privateKey: text('private_key').notNull(),
  publicKey: text('public_key').notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  audit_logs: many(audit_logs),
  oauthAccessTokens: many(oauthAccessTokens),
  oauthClients: many(oauthClients),
  oauthConsents: many(oauthConsents),
  oauthRefreshTokens: many(oauthRefreshTokens),
  passkeys: many(passkeys),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  oauthAccessTokens: many(oauthAccessTokens),
  oauthRefreshTokens: many(oauthRefreshTokens),
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const audit_logsRelations = relations(audit_logs, ({ one }) => ({
  user: one(users, {
    fields: [audit_logs.userId],
    references: [users.id],
  }),
}));

export const oauthClientsRelations = relations(
  oauthClients,
  ({ one, many }) => ({
    oauthAccessTokens: many(oauthAccessTokens),
    oauthConsents: many(oauthConsents),
    oauthRefreshTokens: many(oauthRefreshTokens),
    user: one(users, {
      fields: [oauthClients.userId],
      references: [users.id],
    }),
  }),
);

export const oauthRefreshTokensRelations = relations(
  oauthRefreshTokens,
  ({ one, many }) => ({
    oauthAccessTokens: many(oauthAccessTokens),
    oauthClient: one(oauthClients, {
      fields: [oauthRefreshTokens.clientId],
      references: [oauthClients.clientId],
    }),
    session: one(sessions, {
      fields: [oauthRefreshTokens.sessionId],
      references: [sessions.id],
    }),
    user: one(users, {
      fields: [oauthRefreshTokens.userId],
      references: [users.id],
    }),
  }),
);

export const oauthAccessTokensRelations = relations(
  oauthAccessTokens,
  ({ one }) => ({
    oauthClient: one(oauthClients, {
      fields: [oauthAccessTokens.clientId],
      references: [oauthClients.clientId],
    }),
    oauthRefreshToken: one(oauthRefreshTokens, {
      fields: [oauthAccessTokens.refreshId],
      references: [oauthRefreshTokens.id],
    }),
    session: one(sessions, {
      fields: [oauthAccessTokens.sessionId],
      references: [sessions.id],
    }),
    user: one(users, {
      fields: [oauthAccessTokens.userId],
      references: [users.id],
    }),
  }),
);

export const oauthConsentsRelations = relations(oauthConsents, ({ one }) => ({
  oauthClient: one(oauthClients, {
    fields: [oauthConsents.clientId],
    references: [oauthClients.clientId],
  }),
  user: one(users, {
    fields: [oauthConsents.userId],
    references: [users.id],
  }),
}));

export const passkeysRelations = relations(passkeys, ({ one }) => ({
  user: one(users, {
    fields: [passkeys.userId],
    references: [users.id],
  }),
}));
