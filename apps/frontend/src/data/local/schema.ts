// Schema — single source of truth for the local SQLite database.
// Adding a new table: define it here, run `bun run db:generate`, register the migration.

import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  primaryKey,
  customType,
} from 'drizzle-orm/sqlite-core';
import type {
  ExerciseCategory,
  ExerciseEquipment,
  MuscleGroup,
} from './enums';

// ─── Custom column types ─────────────────────────────────────────────────────

/** Text column that auto-parses/serializes a JSON array. */
const jsonArray = <T>() =>
  customType<{ data: T[]; driverData: string }>({
    dataType: () => 'text',
    toDriver: (value: T[]) => JSON.stringify(value),
    fromDriver: (value: string) => JSON.parse(value) as T[],
  });

/** Text column narrowed to a string union (enum). */
const enumText = <T extends string>() =>
  customType<{ data: T; driverData: string }>({
    dataType: () => 'text',
    toDriver: (value: T) => value,
    fromDriver: (value: string) => value as T,
  });

// ─── Exercise ────────────────────────────────────────────────────────────────

export const exercises = sqliteTable('exercise', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  exerciseCategory: enumText<ExerciseCategory>()('exercise_category').notNull(),
  muscleGroups: jsonArray<MuscleGroup>()('muscle_groups').notNull(),
  equipment: jsonArray<ExerciseEquipment>()('equipment').notNull(),
  createdAt: integer('created_at').notNull(),
});

// ─── Workout Template ────────────────────────────────────────────────────────

export const workoutTemplates = sqliteTable('workout_template', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  scheduleType: text('schedule_type'),
  scheduleInterval: integer('schedule_interval'),
});

export const workoutTemplateExercises = sqliteTable(
  'workout_template_exercise',
  {
    id: text('id').primaryKey().notNull(),
    workoutTemplateId: text('workout_template_id')
      .notNull()
      .references(() => workoutTemplates.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id').notNull(),
    orderIndex: integer('order_index').notNull(),
    sets: integer('sets').notNull(),
    targetReps: text('target_reps').notNull(),
    targetWeight: real('target_weight'),
    restSeconds: integer('rest_seconds'),
    notes: text('notes'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
);

export const workoutTemplateScheduleWeekdays = sqliteTable(
  'workout_template_schedule_weekday',
  {
    workoutTemplateId: text('workout_template_id')
      .notNull()
      .references(() => workoutTemplates.id, { onDelete: 'cascade' }),
    weekday: text('weekday').notNull(),
  },
  table => [
    primaryKey({
      columns: [table.workoutTemplateId, table.weekday],
      name: 'workout_template_schedule_weekday_pk',
    }),
  ],
);

// ─── Workout Session ─────────────────────────────────────────────────────────

export const workoutSessions = sqliteTable(
  'workout_session',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id').notNull(),
    workoutTemplateId: text('workout_template_id').references(
      () => workoutTemplates.id,
      { onDelete: 'set null' },
    ),
    name: text('name').notNull(),
    startedAt: integer('started_at').notNull(),
    endedAt: integer('ended_at'),
    notes: text('notes'),
  },
  table => [
    index('idx_sessions_user_date').on(table.userId, table.startedAt),
  ],
);

export const workoutSessionSets = sqliteTable(
  'workout_session_set',
  {
    id: text('id').primaryKey().notNull(),
    workoutSessionId: text('workout_session_id')
      .notNull()
      .references(() => workoutSessions.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id').notNull(),
    setIndex: integer('set_index').notNull(),
    reps: integer('reps').notNull(),
    weight: real('weight'),
    restSeconds: integer('rest_seconds'),
    durationSeconds: integer('duration_seconds'),
    notes: text('notes'),
    performedAt: integer('performed_at').notNull(),
    rpe: real('rpe'),
  },
  table => [
    index('idx_sets_session').on(table.workoutSessionId, table.setIndex),
    index('idx_sets_exercise').on(table.exerciseId, table.performedAt),
  ],
);

// ─── Sync (kept for existing devices, decoupled from write path) ─────────────

export const syncQueue = sqliteTable('sync_queue', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entity: text('entity').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  payload: text('payload').notNull(),
  createdAt: integer('created_at').notNull(),
  retries: integer('retries').notNull().default(0),
  lastError: text('last_error'),
});

export const syncMetadata = sqliteTable('sync_metadata', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
