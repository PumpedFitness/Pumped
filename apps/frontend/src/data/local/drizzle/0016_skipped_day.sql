CREATE TABLE `skipped_day` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`day_index` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_skipped_day_user_day` ON `skipped_day` (`user_id`,`day_index`);