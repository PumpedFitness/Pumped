import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const bodyWeightEntries = sqliteTable('body_weight_entries', {
  id: text('id').primaryKey().notNull(),
  value: real('value').notNull(),
  recordedAt: integer('recorded_at').notNull(),
});

export const bodyFatEntries = sqliteTable('body_fat_entries', {
  id: text('id').primaryKey().notNull(),
  value: real('value').notNull(),
  recordedAt: integer('recorded_at').notNull(),
});
