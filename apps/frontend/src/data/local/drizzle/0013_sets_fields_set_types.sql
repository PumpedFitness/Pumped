ALTER TABLE `workout_template` DROP COLUMN `status`;
--> statement-breakpoint
ALTER TABLE `workout_template_exercise` ADD `type_id` text;
--> statement-breakpoint
ALTER TABLE `workout_template_exercise` ADD `custom_field_ids` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
ALTER TABLE `workout_template_set` ADD `target_weight` real;
--> statement-breakpoint
ALTER TABLE `workout_template_set` ADD `rest_seconds` integer;
--> statement-breakpoint
ALTER TABLE `workout_template_set` ADD `fields` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
UPDATE `workout_template_set`
SET `fields` = '[' ||
  CASE WHEN `target_percentage_1rm` IS NOT NULL
    THEN json_object('fieldId', 'PERCENT_1RM', 'value', `target_percentage_1rm`) ELSE '' END ||
  CASE WHEN `target_percentage_1rm` IS NOT NULL AND `target_rpe` IS NOT NULL THEN ',' ELSE '' END ||
  CASE WHEN `target_rpe` IS NOT NULL
    THEN json_object('fieldId', 'RPE', 'value', `target_rpe`) ELSE '' END ||
  ']'
WHERE `target_percentage_1rm` IS NOT NULL OR `target_rpe` IS NOT NULL;
--> statement-breakpoint
ALTER TABLE `workout_template_set` DROP COLUMN `target_percentage_1rm`;
--> statement-breakpoint
ALTER TABLE `workout_template_set` DROP COLUMN `target_rpe`;
--> statement-breakpoint
CREATE TABLE `set_type` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_built_in` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `set_field` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`input_type` text NOT NULL,
	`is_built_in` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workout_exercise_type` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
