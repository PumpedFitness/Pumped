CREATE TABLE `body_fat_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`value` real NOT NULL,
	`recorded_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `body_weight_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`value` real NOT NULL,
	`recorded_at` integer NOT NULL
);
