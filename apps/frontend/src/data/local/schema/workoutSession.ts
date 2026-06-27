import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import type { SetTypeId, WorkoutTemplateColor } from '@/data/local/enums';
import type { IconName } from '@/components/icons/ClayIcon';
import type { SetFieldValue } from '@/types/workout';
import { enumText, jsonArray } from './columns';
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
    // Visual identity snapshotted from the template at finish time, so history
    // stays fixed even if the template is later recolored or deleted. Nullable:
    // pre-snapshot/imported sessions fall back to the default accent.
    color: enumText<WorkoutTemplateColor>()('color'),
    icon: enumText<IconName>()('icon'),
    picture: text('picture'),
    importId: integer('import_id'),
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
    setType: enumText<SetTypeId>()('set_type').notNull(),
    // Universal per-set rest, independent of the set type's fields.
    restSeconds: integer('rest_seconds'),
    // Actual values logged for the set type's fields, keyed by set_type_field id.
    fieldValues: jsonArray<SetFieldValue>()('field_values').notNull().default([]),
    performedAt: integer('performed_at'),
    importId: integer('import_id'),
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
