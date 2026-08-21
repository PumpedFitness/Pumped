-- Supersets: a contiguous run of workout_template_exercise rows that share a
-- superset_id is performed back-to-back, one set of each per round.
--
-- The group row carries only its two rest values. The round count is derived
-- from the members' set counts and the group's place in the workout from the
-- members' positions, so there is no second copy of either to drift.
CREATE TABLE `workout_template_superset` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_template_id` text NOT NULL,
	`rest_seconds` integer,
	`transition_rest_seconds` integer,
	FOREIGN KEY (`workout_template_id`) REFERENCES `workout_template`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_template_superset_template` ON `workout_template_superset` (`workout_template_id`);--> statement-breakpoint
ALTER TABLE `workout_template_exercise` ADD `superset_id` text;--> statement-breakpoint
ALTER TABLE `performed_set` ADD `superset_id` text;
