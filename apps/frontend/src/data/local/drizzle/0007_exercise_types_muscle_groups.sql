CREATE TABLE `exercise_type` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `muscle_group` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `exercise` ADD COLUMN `type_id` text;
--> statement-breakpoint
ALTER TABLE `exercise` ADD COLUMN `picture` text;
--> statement-breakpoint
ALTER TABLE `exercise` DROP COLUMN `exercise_category`;
--> statement-breakpoint
ALTER TABLE `exercise` DROP COLUMN `equipment`;
