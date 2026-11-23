ALTER TABLE `oauth_clients` RENAME COLUMN "type" TO "application_type";--> statement-breakpoint
CREATE TABLE `oauth_client_assertions` (
	`expires_at` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `oauth_client_resources` (
	`client_id` text NOT NULL,
	`created_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`metadata` text,
	`resource_id` text NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `oauth_clients`(`client_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`resource_id`) REFERENCES `oauth_resources`(`identifier`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `oauthClientResources_clientId_resourceId_uidx` ON `oauth_client_resources` (`client_id`,`resource_id`);--> statement-breakpoint
CREATE INDEX `oauthClientResources_clientId_idx` ON `oauth_client_resources` (`client_id`);--> statement-breakpoint
CREATE INDEX `oauthClientResources_resourceId_idx` ON `oauth_client_resources` (`resource_id`);--> statement-breakpoint
CREATE TABLE `oauth_resources` (
	`access_token_ttl` integer,
	`allowed_scopes` text,
	`created_at` integer,
	`custom_claims` text,
	`disabled` integer DEFAULT false,
	`dpop_bound_access_tokens_required` integer DEFAULT false,
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`metadata` text,
	`name` text NOT NULL,
	`policy_version` integer DEFAULT 1,
	`refresh_token_ttl` integer,
	`signing_algorithm` text,
	`signing_key_id` text,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_resources_identifier_unique` ON `oauth_resources` (`identifier`);--> statement-breakpoint
ALTER TABLE `oauth_clients` ADD `backchannel_logout_session_required` integer;--> statement-breakpoint
ALTER TABLE `oauth_clients` ADD `backchannel_logout_uri` text;--> statement-breakpoint
ALTER TABLE `oauth_clients` ADD `client_credentials_scopes` text DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `oauth_clients` ADD `client_discovery_id` text;--> statement-breakpoint
ALTER TABLE `oauth_clients` ADD `dpop_bound_access_tokens` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `oauth_clients` ADD `jwks` text;--> statement-breakpoint
ALTER TABLE `oauth_clients` ADD `jwks_uri` text;--> statement-breakpoint
CREATE INDEX `oauthClients_userId_idx` ON `oauth_clients` (`user_id`);--> statement-breakpoint
ALTER TABLE `oauth_clients` DROP COLUMN `public`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_accounts` (
	`access_token` text,
	`access_token_expires_at` integer,
	`account_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`id_token` text,
	`password` text,
	`provider_id` text NOT NULL,
	`refresh_token` text,
	`refresh_token_expires_at` integer,
	`scope` text,
	`updated_at` integer NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_accounts`("access_token", "access_token_expires_at", "account_id", "created_at", "id", "id_token", "password", "provider_id", "refresh_token", "refresh_token_expires_at", "scope", "updated_at", "user_id") SELECT "access_token", "access_token_expires_at", "account_id", "created_at", "id", "id_token", "password", "provider_id", "refresh_token", "refresh_token_expires_at", "scope", "updated_at", "user_id" FROM `accounts`;--> statement-breakpoint
DROP TABLE `accounts`;--> statement-breakpoint
ALTER TABLE `__new_accounts` RENAME TO `accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `accounts_userId_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_audit_logs` (
	`action` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`ip_address` text,
	`metadata` text,
	`severity` text NOT NULL,
	`status` text NOT NULL,
	`user_agent` text,
	`user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_audit_logs`("action", "created_at", "id", "ip_address", "metadata", "severity", "status", "user_agent", "user_id") SELECT "action", "created_at", "id", "ip_address", "metadata", "severity", "status", "user_agent", "user_id" FROM `audit_logs`;--> statement-breakpoint
DROP TABLE `audit_logs`;--> statement-breakpoint
ALTER TABLE `__new_audit_logs` RENAME TO `audit_logs`;--> statement-breakpoint
CREATE INDEX `audit_logs_userId_idx` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `audit_logs_createdAt_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`expires_at` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`impersonated_by` text,
	`ip_address` text,
	`token` text NOT NULL,
	`updated_at` integer NOT NULL,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sessions`("created_at", "expires_at", "id", "impersonated_by", "ip_address", "token", "updated_at", "user_agent", "user_id") SELECT "created_at", "expires_at", "id", "impersonated_by", "ip_address", "token", "updated_at", "user_agent", "user_id" FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE INDEX `sessions_userId_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_users` (
	`ban_expires` integer,
	`banned` integer DEFAULT false,
	`ban_reason` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`display_username` text,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`image` text,
	`name` text NOT NULL,
	`role` text,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`username` text
);
--> statement-breakpoint
INSERT INTO `__new_users`("ban_expires", "banned", "ban_reason", "created_at", "display_username", "email", "email_verified", "id", "image", "name", "role", "updated_at", "username") SELECT "ban_expires", "banned", "ban_reason", "created_at", "display_username", "email", "email_verified", "id", "image", "name", "role", "updated_at", "username" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `__new_verifications` (
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`expires_at` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_verifications`("created_at", "expires_at", "id", "identifier", "updated_at", "value") SELECT "created_at", "expires_at", "id", "identifier", "updated_at", "value" FROM `verifications`;--> statement-breakpoint
DROP TABLE `verifications`;--> statement-breakpoint
ALTER TABLE `__new_verifications` RENAME TO `verifications`;--> statement-breakpoint
CREATE INDEX `verifications_identifier_idx` ON `verifications` (`identifier`);--> statement-breakpoint
ALTER TABLE `jwkss` ADD `alg` text;--> statement-breakpoint
ALTER TABLE `jwkss` ADD `crv` text;--> statement-breakpoint
ALTER TABLE `oauth_access_tokens` ADD `authorization_code_id` text;--> statement-breakpoint
ALTER TABLE `oauth_access_tokens` ADD `confirmation` text;--> statement-breakpoint
ALTER TABLE `oauth_access_tokens` ADD `requested_user_info_claims` text;--> statement-breakpoint
ALTER TABLE `oauth_access_tokens` ADD `resources` text;--> statement-breakpoint
ALTER TABLE `oauth_access_tokens` ADD `revoked` integer;--> statement-breakpoint
CREATE INDEX `oauthAccessTokens_clientId_idx` ON `oauth_access_tokens` (`client_id`);--> statement-breakpoint
CREATE INDEX `oauthAccessTokens_sessionId_idx` ON `oauth_access_tokens` (`session_id`);--> statement-breakpoint
CREATE INDEX `oauthAccessTokens_userId_idx` ON `oauth_access_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `oauthAccessTokens_authorizationCodeId_idx` ON `oauth_access_tokens` (`authorization_code_id`);--> statement-breakpoint
CREATE INDEX `oauthAccessTokens_refreshId_idx` ON `oauth_access_tokens` (`refresh_id`);--> statement-breakpoint
ALTER TABLE `oauth_consents` ADD `requested_user_info_claims` text;--> statement-breakpoint
ALTER TABLE `oauth_consents` ADD `resources` text;--> statement-breakpoint
CREATE INDEX `oauthConsents_clientId_idx` ON `oauth_consents` (`client_id`);--> statement-breakpoint
CREATE INDEX `oauthConsents_userId_idx` ON `oauth_consents` (`user_id`);--> statement-breakpoint
ALTER TABLE `oauth_refresh_tokens` ADD `authorization_code_id` text;--> statement-breakpoint
ALTER TABLE `oauth_refresh_tokens` ADD `confirmation` text;--> statement-breakpoint
ALTER TABLE `oauth_refresh_tokens` ADD `requested_user_info_claims` text;--> statement-breakpoint
ALTER TABLE `oauth_refresh_tokens` ADD `resources` text;--> statement-breakpoint
ALTER TABLE `oauth_refresh_tokens` ADD `rotated_at` integer;--> statement-breakpoint
ALTER TABLE `oauth_refresh_tokens` ADD `rotation_replay_expires_at` integer;--> statement-breakpoint
ALTER TABLE `oauth_refresh_tokens` ADD `rotation_replay_response` text;--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_refresh_tokens_token_unique` ON `oauth_refresh_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `oauthRefreshTokens_clientId_idx` ON `oauth_refresh_tokens` (`client_id`);--> statement-breakpoint
CREATE INDEX `oauthRefreshTokens_sessionId_idx` ON `oauth_refresh_tokens` (`session_id`);--> statement-breakpoint
CREATE INDEX `oauthRefreshTokens_userId_idx` ON `oauth_refresh_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `oauthRefreshTokens_authorizationCodeId_idx` ON `oauth_refresh_tokens` (`authorization_code_id`);