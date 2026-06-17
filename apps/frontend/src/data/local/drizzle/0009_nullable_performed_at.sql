CREATE TABLE `__new_performed_set` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_session_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`exercise_position` integer NOT NULL,
	`set_position` integer NOT NULL,
	`set_type` text NOT NULL,
	`reps` integer NOT NULL,
	`weight` real,
	`rpe` real,
	`performed_at` integer,
	FOREIGN KEY (`workout_session_id`) REFERENCES `workout_session`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_performed_set` (
	`id`,
	`workout_session_id`,
	`exercise_id`,
	`exercise_position`,
	`set_position`,
	`set_type`,
	`reps`,
	`weight`,
	`rpe`,
	`performed_at`
)
SELECT
	`id`,
	`workout_session_id`,
	`exercise_id`,
	`exercise_position`,
	`set_position`,
	`set_type`,
	`reps`,
	`weight`,
	`rpe`,
	`performed_at`
FROM `performed_set`;
--> statement-breakpoint
DROP TABLE `performed_set`;
--> statement-breakpoint
ALTER TABLE `__new_performed_set` RENAME TO `performed_set`;
--> statement-breakpoint
CREATE INDEX `idx_performed_sets_session_position` ON `performed_set` (
	`workout_session_id`,
	`exercise_position`,
	`set_position`
);
--> statement-breakpoint
CREATE INDEX `idx_performed_sets_exercise_date` ON `performed_set` (
	`exercise_id`,
	`performed_at`
);
