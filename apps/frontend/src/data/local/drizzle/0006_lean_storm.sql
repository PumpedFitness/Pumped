CREATE TABLE `user_profile` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`gender` text,
	`birthdate` text,
	`height_cm` real,
	`weight_unit` text DEFAULT 'kg' NOT NULL
);
