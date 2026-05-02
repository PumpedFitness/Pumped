CREATE TABLE `exercise` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`exercise_category` text NOT NULL,
	`created_at` integer NOT NULL,
	`muscle_groups` text NOT NULL,
	`equipment` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_metadata` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`action` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer NOT NULL,
	`retries` integer DEFAULT 0 NOT NULL,
	`last_error` text
);
--> statement-breakpoint
CREATE TABLE `workout_session_set` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_session_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`set_index` integer NOT NULL,
	`reps` integer NOT NULL,
	`weight` real,
	`rest_seconds` integer,
	`duration_seconds` integer,
	`notes` text,
	`performed_at` integer NOT NULL,
	`rpe` real,
	FOREIGN KEY (`workout_session_id`) REFERENCES `workout_session`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_sets_session` ON `workout_session_set` (`workout_session_id`,`set_index`);--> statement-breakpoint
CREATE INDEX `idx_sets_exercise` ON `workout_session_set` (`exercise_id`,`performed_at`);--> statement-breakpoint
CREATE TABLE `workout_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workout_template_id` text,
	`name` text NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`notes` text,
	FOREIGN KEY (`workout_template_id`) REFERENCES `workout_template`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_user_date` ON `workout_session` (`user_id`,`started_at`);--> statement-breakpoint
CREATE TABLE `workout_template_exercise` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_template_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`order_index` integer NOT NULL,
	`sets` integer NOT NULL,
	`target_reps` text NOT NULL,
	`target_weight` real,
	`rest_seconds` integer,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`workout_template_id`) REFERENCES `workout_template`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workout_template_schedule_weekday` (
	`workout_template_id` text NOT NULL,
	`weekday` text NOT NULL,
	PRIMARY KEY(`workout_template_id`, `weekday`),
	FOREIGN KEY (`workout_template_id`) REFERENCES `workout_template`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workout_template` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`schedule_type` text,
	`schedule_interval` integer
);
