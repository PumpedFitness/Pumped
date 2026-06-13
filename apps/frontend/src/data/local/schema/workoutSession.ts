import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from 'drizzle-orm/sqlite-core';
import type { WorkoutSetType } from '@/data/local/enums';
import { enumText } from './columns';
import { workoutTemplates } from './workoutTemplate';

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
  table => [index('idx_sessions_user_date').on(table.userId, table.startedAt)],
);

export const performedSets = sqliteTable(
  'performed_set',
  {
    id: text('id').primaryKey().notNull(),
    workoutSessionId: text('workout_session_id')
      .notNull()
      .references(() => workoutSessions.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id').notNull(),
    exercisePosition: integer('exercise_position').notNull(),
    setPosition: integer('set_position').notNull(),
    setType: enumText<WorkoutSetType>()('set_type').notNull(),
    reps: integer('reps').notNull(),
    weight: real('weight'),
    rpe: real('rpe'),
    performedAt: integer('performed_at').notNull(),
  },
  table => [
    index('idx_performed_sets_session_position').on(
      table.workoutSessionId,
      table.exercisePosition,
      table.setPosition,
    ),
    index('idx_performed_sets_exercise_date').on(
      table.exerciseId,
      table.performedAt,
    ),
  ],
);
