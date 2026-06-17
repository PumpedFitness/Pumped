DROP INDEX `idx_schedule_owner`;
--> statement-breakpoint
CREATE TABLE `__new_schedule` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`recurrence_type` text NOT NULL,
	`period_length` integer NOT NULL,
	`anchor_day` integer NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_schedule` (`id`,`user_id`,`name`,`recurrence_type`,`period_length`,`anchor_day`,`is_active`,`created_at`,`updated_at`)
SELECT `id`,`user_id`,`name`,`recurrence_type`,`period_length`,`anchor_day`,`is_active`,`created_at`,`updated_at` FROM `schedule`;
--> statement-breakpoint
CREATE TABLE `__schedule_slot_backup` AS SELECT * FROM `schedule_slot`;
--> statement-breakpoint
DROP TABLE `schedule`;
--> statement-breakpoint
ALTER TABLE `__new_schedule` RENAME TO `schedule`;
--> statement-breakpoint
INSERT INTO `schedule_slot` (`id`,`schedule_id`,`day_offset`,`position`,`workout_template_id`)
SELECT `id`,`schedule_id`,`day_offset`,`position`,`workout_template_id` FROM `__schedule_slot_backup`;
--> statement-breakpoint
DROP TABLE `__schedule_slot_backup`;