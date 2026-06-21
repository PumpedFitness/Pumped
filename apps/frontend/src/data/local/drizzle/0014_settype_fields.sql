CREATE TABLE `set_type_field` (
	`id` text PRIMARY KEY NOT NULL,
	`set_type_id` text NOT NULL,
	`name` text NOT NULL,
	`data_type` text NOT NULL,
	`unit` text,
	`position` integer DEFAULT 0 NOT NULL,
	`config` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`set_type_id`) REFERENCES `set_type`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_set_type_field_type_position` ON `set_type_field` (`set_type_id`,`position`);
--> statement-breakpoint
ALTER TABLE `set_type` ADD `icon` text;
--> statement-breakpoint
ALTER TABLE `set_type` ADD `position` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
DROP TABLE `set_field`;
--> statement-breakpoint
DELETE FROM `performed_set`;
--> statement-breakpoint
DELETE FROM `workout_session`;
--> statement-breakpoint
DELETE FROM `workout_template_set`;
--> statement-breakpoint
DELETE FROM `workout_template_exercise`;
--> statement-breakpoint
DELETE FROM `workout_template`;
--> statement-breakpoint
ALTER TABLE `workout_template_set` DROP COLUMN `target_reps`;
--> statement-breakpoint
ALTER TABLE `workout_template_set` DROP COLUMN `target_weight`;
--> statement-breakpoint
ALTER TABLE `workout_template_set` DROP COLUMN `fields`;
--> statement-breakpoint
ALTER TABLE `workout_template_set` ADD `field_values` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
ALTER TABLE `workout_template_exercise` DROP COLUMN `custom_field_ids`;
--> statement-breakpoint
ALTER TABLE `performed_set` DROP COLUMN `reps`;
--> statement-breakpoint
ALTER TABLE `performed_set` DROP COLUMN `weight`;
--> statement-breakpoint
ALTER TABLE `performed_set` DROP COLUMN `rpe`;
--> statement-breakpoint
ALTER TABLE `performed_set` ADD `rest_seconds` integer;
--> statement-breakpoint
ALTER TABLE `performed_set` ADD `field_values` text DEFAULT '[]' NOT NULL;
