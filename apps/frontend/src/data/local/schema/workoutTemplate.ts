import { index, sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import type { SetTypeId, WorkoutTemplateColor } from '@/data/local/enums';
import type { IconName } from '@pumped/ui/icons/ClayIcon';
import type { ProgressionGoal } from '@/types/setType';
import type { SetFieldValue } from '@/types/workout';
import { enumText, jsonArray, jsonObject } from './columns';

// Scheduling no longer lives on the template — it moved to the `schedule` /
// `schedule_slot` tables (see schema/schedule.ts). Templates are pure workout
// definitions; Schedules reference them by id.
export const workoutTemplates = sqliteTable('workout_template', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  color: enumText<WorkoutTemplateColor>()('color')
    .notNull()
    .default('TERRACOTTA'),
  // Optional visual identity. `icon` is a ClayIcon glyph (logo); `picture` is a
  // device image URI. Either, both, or neither — presentation prefers picture,
  // then icon, then a color-tinted default. Both nullable (default = neither).
  icon: enumText<IconName>()('icon'),
  picture: text('picture'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// A superset: the exercises that carry this id are performed back-to-back,
// alternating one set each per round. The group owns only its rest values — the
// round count is derived from its members' set counts, and its place in the
// workout from its members' positions, so neither can drift out of sync.
export const workoutTemplateSupersets = sqliteTable(
  'workout_template_superset',
  {
    id: text('id').primaryKey().notNull(),
    workoutTemplateId: text('workout_template_id')
      .notNull()
      .references(() => workoutTemplates.id, { onDelete: 'cascade' }),
    // Rest after a completed round (every member performed once).
    restSeconds: integer('rest_seconds'),
    // Optional rest between two exercises inside a round, for equipment changes.
    transitionRestSeconds: integer('transition_rest_seconds'),
  },
  table => [
    index('idx_template_superset_template').on(table.workoutTemplateId),
  ],
);

export const workoutTemplateExercises = sqliteTable(
  'workout_template_exercise',
  {
    id: text('id').primaryKey().notNull(),
    workoutTemplateId: text('workout_template_id')
      .notNull()
      .references(() => workoutTemplates.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id').notNull(),
    position: integer('position').notNull(),
    // Superset membership; null means the exercise stands alone. Members of one
    // group are kept contiguous in `position` order by the editor.
    supersetId: text('superset_id'),
    // Training-intent tag for this exercise (→ workout_exercise_type), nullable.
    typeId: text('type_id'),
    // Per-placement accent color. Nullable: null means "inherit" (falls back to
    // the template color in presentation), never confused with a chosen color.
    color: enumText<WorkoutTemplateColor>()('color'),
    goal: text('goal'),
    notes: text('notes'),
  },
  table => [
    index('idx_template_exercises_template_position').on(
      table.workoutTemplateId,
      table.position,
    ),
  ],
);

export const workoutTemplateSets = sqliteTable(
  'workout_template_set',
  {
    id: text('id').primaryKey().notNull(),
    workoutTemplateExerciseId: text('workout_template_exercise_id')
      .notNull()
      .references(() => workoutTemplateExercises.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    // Holds a set_type id (built-in id or user-created uuid).
    setType: enumText<SetTypeId>()('set_type').notNull(),
    // Universal per-set rest, independent of the set type's fields.
    restSeconds: integer('rest_seconds'),
    // Optional per-template-set progression override. Null means use the set
    // type's default progression goal.
    progressionGoal: jsonObject<ProgressionGoal>()('progression_goal'),
    // Target values for the set type's fields, keyed by set_type_field id.
    fieldValues: jsonArray<SetFieldValue>()('field_values')
      .notNull()
      .default([]),
  },
  table => [
    index('idx_template_sets_exercise_position').on(
      table.workoutTemplateExerciseId,
      table.position,
    ),
  ],
);
