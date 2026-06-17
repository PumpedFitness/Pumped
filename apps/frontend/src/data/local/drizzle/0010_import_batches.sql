CREATE TABLE `import_batch` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text NOT NULL,
	`imported_at` integer NOT NULL,
	`workouts_imported` integer NOT NULL,
	`sets_imported` integer NOT NULL,
	`exercises_created` integer NOT NULL,
	`rows_skipped` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `exercise` ADD COLUMN `import_id` integer;
--> statement-breakpoint
ALTER TABLE `workout_session` ADD COLUMN `import_id` integer;
--> statement-breakpoint
ALTER TABLE `performed_set` ADD COLUMN `import_id` integer;
--> statement-breakpoint
CREATE INDEX `idx_exercise_import` ON `exercise` (`import_id`);
--> statement-breakpoint
CREATE INDEX `idx_workout_session_import` ON `workout_session` (`import_id`);
--> statement-breakpoint
CREATE INDEX `idx_performed_set_import` ON `performed_set` (`import_id`);
