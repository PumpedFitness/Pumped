import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { PeriodizationPhase } from '@/types/periodization';
import { jsonArray } from './columns';

// Periodization workouts are private snapshots, intentionally embedded in the
// plan instead of inserted into the normal workout-template library.
export const periodizations = sqliteTable('periodization', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  phases: jsonArray<PeriodizationPhase>()('phases').notNull(),
  anchorDay: integer('anchor_day'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
