ALTER TABLE `set_type` ADD `default_rest_seconds` integer;
--> statement-breakpoint
UPDATE `set_type` SET `default_rest_seconds` = 60 WHERE `id` = 'WARMUP';
--> statement-breakpoint
UPDATE `set_type` SET `default_rest_seconds` = 120 WHERE `id` = 'NORMAL';
--> statement-breakpoint
UPDATE `set_type` SET `default_rest_seconds` = 180 WHERE `id` = 'MAX_EFFORT';
