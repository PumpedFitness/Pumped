import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

// A single skipped scheduled day, keyed by local-midnight day index (the same
// index used everywhere for day boundaries — see scheduleResolution.ts). One row
// per user per skipped day; presence of a row means "today is skipped".
export const skippedDays = sqliteTable(
  'skipped_day',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id').notNull(),
    dayIndex: integer('day_index').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  table => [
    uniqueIndex('idx_skipped_day_user_day').on(table.userId, table.dayIndex),
  ],
);
