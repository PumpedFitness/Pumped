import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { jsonArray } from './columns';
import { importBatches } from './importBatch';

export const exercises = sqliteTable('exercise', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  typeId: text('type_id'),
  picture: text('picture'),
  muscleGroups: jsonArray<string>()('muscle_groups').notNull(),
  createdAt: integer('created_at').notNull(),
  importId: integer('import_id').references(() => importBatches.id, {
    onDelete: 'set null',
  }),
});
