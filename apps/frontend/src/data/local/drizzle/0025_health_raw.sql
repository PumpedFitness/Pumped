-- Rohschicht für Gesundheitsdaten aus einer externen Quelle.
--
-- Alle vier Datentabellen sind WITHOUT ROWID: Der Primärschlüssel aus Metrik
-- und Zeitpunkt ist der natürliche Schlüssel, ein zusätzlicher rowid wäre nur
-- eine zweite Wahrheit. Nebenwirkung mit Absicht: Es gibt keinen rowid, auf den
-- sich eine Tie-Break-Regel stützen könnte, und Duplikate je Tag und Feld sind
-- ausgeschlossen.

CREATE TABLE `health_raw_daily` (
	`metric` integer NOT NULL,
	`date` integer NOT NULL,
	`field` integer NOT NULL,
	`value` real NOT NULL,
	PRIMARY KEY(`metric`, `date`, `field`)
) WITHOUT ROWID;
--> statement-breakpoint
CREATE TABLE `health_raw_sample` (
	`metric` integer NOT NULL,
	`ts` integer NOT NULL,
	`field` integer NOT NULL,
	`tz_off` integer NOT NULL,
	`value` real NOT NULL,
	PRIMARY KEY(`metric`, `ts`, `field`)
) WITHOUT ROWID;
--> statement-breakpoint
CREATE TABLE `health_raw_session` (
	`metric` integer NOT NULL,
	`start_ts` integer NOT NULL,
	`end_ts` integer NOT NULL,
	`tz_off` integer NOT NULL,
	`sleep` text,
	`source_payload` text,
	PRIMARY KEY(`metric`, `start_ts`)
) WITHOUT ROWID;
--> statement-breakpoint
CREATE INDEX `idx_health_raw_session_end` ON `health_raw_session` (`metric`,`end_ts`);
--> statement-breakpoint
CREATE TABLE `health_sync_state` (
	`metric` integer PRIMARY KEY NOT NULL,
	`newest_ts` integer NOT NULL,
	`last_success` integer
) WITHOUT ROWID;
--> statement-breakpoint
CREATE TABLE `health_annotation` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`start_ts` integer NOT NULL,
	`end_ts` integer,
	`tz_off` integer NOT NULL,
	`note` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_health_annotation_start` ON `health_annotation` (`start_ts`);
