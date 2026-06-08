import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const exerciseTypes = sqliteTable('exercise_type', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  createdAt: integer('created_at').notNull(),
});
