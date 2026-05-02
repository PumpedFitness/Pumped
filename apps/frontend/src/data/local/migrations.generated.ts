// @generated — do not edit manually.
// Source: drizzle-kit generate output in src/data/local/drizzle.
// Regenerate with: bun run migrations:generate

const migrations = {
  "journal": {
    "version": "7",
    "dialect": "sqlite",
    "entries": [
      {
        "idx": 0,
        "version": "6",
        "when": 1777717169067,
        "tag": "0000_overjoyed_alex_wilder",
        "breakpoints": true
      }
    ]
  },
  "migrations": {
    "m0000": "CREATE TABLE `exercise` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`name` text NOT NULL,\n\t`description` text,\n\t`exercise_category` text NOT NULL,\n\t`created_at` integer NOT NULL,\n\t`muscle_groups` text NOT NULL,\n\t`equipment` text NOT NULL\n);\n--> statement-breakpoint\nCREATE TABLE `sync_metadata` (\n\t`key` text PRIMARY KEY NOT NULL,\n\t`value` text NOT NULL\n);\n--> statement-breakpoint\nCREATE TABLE `sync_queue` (\n\t`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,\n\t`entity` text NOT NULL,\n\t`entity_id` text NOT NULL,\n\t`action` text NOT NULL,\n\t`payload` text NOT NULL,\n\t`created_at` integer NOT NULL,\n\t`retries` integer DEFAULT 0 NOT NULL,\n\t`last_error` text\n);\n--> statement-breakpoint\nCREATE TABLE `workout_session_set` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`workout_session_id` text NOT NULL,\n\t`exercise_id` text NOT NULL,\n\t`set_index` integer NOT NULL,\n\t`reps` integer NOT NULL,\n\t`weight` real,\n\t`rest_seconds` integer,\n\t`duration_seconds` integer,\n\t`notes` text,\n\t`performed_at` integer NOT NULL,\n\t`rpe` real,\n\tFOREIGN KEY (`workout_session_id`) REFERENCES `workout_session`(`id`) ON UPDATE no action ON DELETE cascade\n);\n--> statement-breakpoint\nCREATE INDEX `idx_sets_session` ON `workout_session_set` (`workout_session_id`,`set_index`);--> statement-breakpoint\nCREATE INDEX `idx_sets_exercise` ON `workout_session_set` (`exercise_id`,`performed_at`);--> statement-breakpoint\nCREATE TABLE `workout_session` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`user_id` text NOT NULL,\n\t`workout_template_id` text,\n\t`name` text NOT NULL,\n\t`started_at` integer NOT NULL,\n\t`ended_at` integer,\n\t`notes` text,\n\tFOREIGN KEY (`workout_template_id`) REFERENCES `workout_template`(`id`) ON UPDATE no action ON DELETE set null\n);\n--> statement-breakpoint\nCREATE INDEX `idx_sessions_user_date` ON `workout_session` (`user_id`,`started_at`);--> statement-breakpoint\nCREATE TABLE `workout_template_exercise` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`workout_template_id` text NOT NULL,\n\t`exercise_id` text NOT NULL,\n\t`order_index` integer NOT NULL,\n\t`sets` integer NOT NULL,\n\t`target_reps` text NOT NULL,\n\t`target_weight` real,\n\t`rest_seconds` integer,\n\t`notes` text,\n\t`created_at` integer NOT NULL,\n\t`updated_at` integer NOT NULL,\n\tFOREIGN KEY (`workout_template_id`) REFERENCES `workout_template`(`id`) ON UPDATE no action ON DELETE cascade\n);\n--> statement-breakpoint\nCREATE TABLE `workout_template_schedule_weekday` (\n\t`workout_template_id` text NOT NULL,\n\t`weekday` text NOT NULL,\n\tPRIMARY KEY(`workout_template_id`, `weekday`),\n\tFOREIGN KEY (`workout_template_id`) REFERENCES `workout_template`(`id`) ON UPDATE no action ON DELETE cascade\n);\n--> statement-breakpoint\nCREATE TABLE `workout_template` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`user_id` text NOT NULL,\n\t`name` text NOT NULL,\n\t`description` text,\n\t`created_at` integer NOT NULL,\n\t`updated_at` integer NOT NULL,\n\t`schedule_type` text,\n\t`schedule_interval` integer\n);\n"
  }
};

export default migrations;
