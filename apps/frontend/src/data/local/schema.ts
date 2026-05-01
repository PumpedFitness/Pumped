import {sqliteTable, text, integer, real, index} from 'drizzle-orm/sqlite-core';

export const exercises = sqliteTable('exercises', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  exerciseCategory: text('exercise_category').notNull(),
  muscleGroups: text('muscle_groups').notNull(), // JSON array string
  equipment: text('equipment').notNull(), // JSON array string
  createdAt: integer('created_at').notNull(),
});

export const workoutTemplates = sqliteTable('workout_templates', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const workoutTemplateExercises = sqliteTable(
  'workout_template_exercises',
  {
    id: text('id').primaryKey(),
    templateId: text('template_id')
      .notNull()
      .references(() => workoutTemplates.id, {onDelete: 'cascade'}),
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id),
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

export const workoutSessions = sqliteTable(
  'workout_sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    templateId: text('template_id').references(() => workoutTemplates.id),
    name: text('name').notNull(),
    startedAt: integer('started_at').notNull(),
    endedAt: integer('ended_at'),
    notes: text('notes'),
  },
  (table) => [
    index('idx_sessions_user_date').on(table.userId, table.startedAt),
  ],
);

export const workoutSessionSets = sqliteTable(
  'workout_session_sets',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => workoutSessions.id, {onDelete: 'cascade'}),
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id),
    setIndex: integer('set_index').notNull(),
    reps: integer('reps').notNull(),
    weight: real('weight'),
    restSeconds: integer('rest_seconds'),
    durationSeconds: integer('duration_seconds'),
    notes: text('notes'),
    performedAt: integer('performed_at').notNull(),
  },
  (table) => [
    index('idx_sets_session').on(table.sessionId, table.setIndex),
    index('idx_sets_exercise').on(table.exerciseId, table.performedAt),
  ],
);

export const syncQueue = sqliteTable('sync_queue', {
  id: integer('id').primaryKey({autoIncrement: true}),
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
