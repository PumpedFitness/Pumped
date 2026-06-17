CREATE TABLE `schedule` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`recurrence_type` text NOT NULL,
	`period_length` integer NOT NULL,
	`anchor_day` integer NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`owner_template_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_template_id`) REFERENCES `workout_template`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_schedule_owner` ON `schedule` (`owner_template_id`);
--> statement-breakpoint
CREATE TABLE `schedule_slot` (
	`id` text PRIMARY KEY NOT NULL,
	`schedule_id` text NOT NULL,
	`day_offset` integer NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`workout_template_id` text NOT NULL,
	FOREIGN KEY (`schedule_id`) REFERENCES `schedule`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workout_template_id`) REFERENCES `workout_template`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_schedule_slot_schedule_day` ON `schedule_slot` (`schedule_id`,`day_offset`,`position`);
--> statement-breakpoint
INSERT INTO `schedule` (`id`,`user_id`,`name`,`kind`,`recurrence_type`,`period_length`,`anchor_day`,`is_active`,`owner_template_id`,`created_at`,`updated_at`)
SELECT 'basic:' || `id`, `user_id`, `name`, 'BASIC',
	CASE `schedule_type` WHEN 'DAYS' THEN 'CYCLE' ELSE 'WEEKLY' END,
	COALESCE(`schedule_interval`, 1),
	CAST(strftime('%s','now') AS integer) / 86400,
	0, `id`, `created_at`, `updated_at`
FROM `workout_template` WHERE `schedule_type` IS NOT NULL;
--> statement-breakpoint
INSERT INTO `schedule_slot` (`id`,`schedule_id`,`day_offset`,`position`,`workout_template_id`)
SELECT 'basic-slot:' || `id`, 'basic:' || `id`, 0, 0, `id`
FROM `workout_template` WHERE `schedule_type` = 'DAYS';
--> statement-breakpoint
INSERT INTO `schedule_slot` (`id`,`schedule_id`,`day_offset`,`position`,`workout_template_id`)
SELECT 'basic-slot:' || w.`workout_template_id` || ':' || w.`weekday`,
	'basic:' || w.`workout_template_id`,
	CASE w.`weekday`
		WHEN 'MONDAY' THEN 0 WHEN 'TUESDAY' THEN 1 WHEN 'WEDNESDAY' THEN 2
		WHEN 'THURSDAY' THEN 3 WHEN 'FRIDAY' THEN 4 WHEN 'SATURDAY' THEN 5
		WHEN 'SUNDAY' THEN 6 END,
	0, w.`workout_template_id`
FROM `workout_template_schedule_weekday` w
INNER JOIN `workout_template` t ON t.`id` = w.`workout_template_id`
WHERE t.`schedule_type` = 'WEEKS';
--> statement-breakpoint
DROP TABLE `workout_template_schedule_weekday`;
--> statement-breakpoint
ALTER TABLE `workout_template` DROP COLUMN `schedule_type`;
--> statement-breakpoint
ALTER TABLE `workout_template` DROP COLUMN `schedule_interval`;