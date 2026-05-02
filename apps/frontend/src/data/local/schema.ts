import {sqliteTable, text, integer} from 'drizzle-orm/sqlite-core';

// Backend-derived entity tables (auto-generated via drizzle-kit pull)
export {
  exercise as exercises,
  workoutTemplate as workoutTemplates,
  workoutTemplateExercise as workoutTemplateExercises,
  workoutSession as workoutSessions,
  workoutSessionSet as workoutSessionSets,
  workoutTemplateScheduleWeekday,
} from './schema.generated';

// Frontend-only tables

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
