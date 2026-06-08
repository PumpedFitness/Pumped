import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const muscleGroups = sqliteTable('muscle_group', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  createdAt: integer('created_at').notNull(),
});
