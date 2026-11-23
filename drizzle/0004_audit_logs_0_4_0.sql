PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_audit_logs` (
	`action` text NOT NULL,
	`created_at` integer NOT NULL,
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
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `auditLogs_userId_idx` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `auditLogs_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `auditLogs_createdAt_idx` ON `audit_logs` (`created_at`);