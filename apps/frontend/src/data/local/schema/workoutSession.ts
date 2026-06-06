import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from 'drizzle-orm/sqlite-core';
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
  table => [
    index('idx_sessions_user_date').on(table.userId, table.startedAt),
  ],
);

export const workoutSessionSets = sqliteTable(
  'workout_session_set',
  {
    id: text('id').primaryKey().notNull(),
    workoutSessionId: text('workout_session_id')
      .notNull()
      .references(() => workoutSessions.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id').notNull(),
    setIndex: integer('set_index').notNull(),
    reps: integer('reps').notNull(),
    weight: real('weight'),
    restSeconds: integer('rest_seconds'),
    durationSeconds: integer('duration_seconds'),
    notes: text('notes'),
    performedAt: integer('performed_at').notNull(),
    rpe: real('rpe'),
  },
  table => [
    index('idx_sets_session').on(table.workoutSessionId, table.setIndex),
    index('idx_sets_exercise').on(table.exerciseId, table.performedAt),
  ],
);
