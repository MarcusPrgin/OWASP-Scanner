PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_scans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`user_id` integer NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT 1771948028986 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_scans`("id", "url", "user_id", "status", "progress", "created_at") SELECT "id", "url", "user_id", "status", "progress", "created_at" FROM `scans`;--> statement-breakpoint
DROP TABLE `scans`;--> statement-breakpoint
ALTER TABLE `__new_scans` RENAME TO `scans`;--> statement-breakpoint
PRAGMA foreign_keys=ON;