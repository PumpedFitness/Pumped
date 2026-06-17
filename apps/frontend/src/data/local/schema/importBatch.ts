import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const importBatches = sqliteTable('import_batch', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  source: text('source').notNull(),
  importedAt: integer('imported_at').notNull(),
  workoutsImported: integer('workouts_imported').notNull(),
  setsImported: integer('sets_imported').notNull(),
  exercisesCreated: integer('exercises_created').notNull(),
  rowsSkipped: integer('rows_skipped').notNull(),
});
