PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `workout_template_set` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_template_exercise_id` text NOT NULL,
	`position` integer NOT NULL,
	`set_type` text NOT NULL,
	FOREIGN KEY (`workout_template_exercise_id`) REFERENCES `workout_template_exercise`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
WITH RECURSIVE `expanded_template_set` (
	`workout_template_exercise_id`,
	`position`,
	`set_count`
) AS (
	SELECT
		`id`,
		0,
		`sets`
	FROM `workout_template_exercise`
	WHERE `sets` > 0

	UNION ALL

	SELECT
		`workout_template_exercise_id`,
		`position` + 1,
		`set_count`
	FROM `expanded_template_set`
	WHERE `position` + 1 < `set_count`
)
INSERT INTO `workout_template_set` (
	`id`,
	`workout_template_exercise_id`,
	`position`,
	`set_type`
)
SELECT
	lower(
		hex(randomblob(4)) || '-' ||
		hex(randomblob(2)) || '-' ||
		hex(randomblob(2)) || '-' ||
		hex(randomblob(2)) || '-' ||
		hex(randomblob(6))
	),
	`workout_template_exercise_id`,
	`position`,
	'NORMAL'
FROM `expanded_template_set`;--> statement-breakpoint
CREATE TABLE `__new_workout_template_exercise` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_template_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`position` integer NOT NULL,
	`goal` text,
	`notes` text,
	FOREIGN KEY (`workout_template_id`) REFERENCES `workout_template`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_workout_template_exercise` (
	`id`,
	`workout_template_id`,
	`exercise_id`,
	`position`,
	`goal`,
	`notes`
)
SELECT
	`id`,
	`workout_template_id`,
	`exercise_id`,
	`order_index`,
	printf(
		'%s reps%s%s',
		`target_reps`,
		CASE
			WHEN `target_weight` IS NOT NULL
				THEN printf(' at %g kg', `target_weight`)
			ELSE ''
		END,
		CASE
			WHEN `rest_seconds` IS NOT NULL
				THEN printf(', %d sec rest', `rest_seconds`)
			ELSE ''
		END
	),
	`notes`
FROM `workout_template_exercise`;--> statement-breakpoint
DROP TABLE `workout_template_exercise`;--> statement-breakpoint
ALTER TABLE `__new_workout_template_exercise` RENAME TO `workout_template_exercise`;--> statement-breakpoint
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
	`performed_at` integer NOT NULL,
	FOREIGN KEY (`workout_session_id`) REFERENCES `workout_session`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
WITH `performed_set_with_first_time` AS (
	SELECT
		*,
		min(`performed_at`) OVER (
			PARTITION BY `workout_session_id`, `exercise_id`
		) AS `exercise_started_at`
	FROM `workout_session_set`
)
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
	dense_rank() OVER (
		PARTITION BY `workout_session_id`
		ORDER BY `exercise_started_at`, `exercise_id`
	) - 1,
	`set_index`,
	'NORMAL',
	`reps`,
	`weight`,
	`rpe`,
	`performed_at`
FROM `performed_set_with_first_time`;--> statement-breakpoint
DROP TABLE `workout_session_set`;--> statement-breakpoint
ALTER TABLE `__new_performed_set` RENAME TO `performed_set`;--> statement-breakpoint
CREATE INDEX `idx_template_exercises_template_position`
	ON `workout_template_exercise` (`workout_template_id`, `position`);--> statement-breakpoint
CREATE INDEX `idx_template_sets_exercise_position`
	ON `workout_template_set` (`workout_template_exercise_id`, `position`);--> statement-breakpoint
CREATE INDEX `idx_performed_sets_session_position`
	ON `performed_set` (`workout_session_id`, `exercise_position`, `set_position`);--> statement-breakpoint
CREATE INDEX `idx_performed_sets_exercise_date`
	ON `performed_set` (`exercise_id`, `performed_at`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
