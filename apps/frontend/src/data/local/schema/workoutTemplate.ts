import {
  index,
  primaryKey,
  sqliteTable,
  text,
  integer,
  real,
} from 'drizzle-orm/sqlite-core';
import type {
  WorkoutScheduleType,
  WorkoutSetType,
  WorkoutTemplateColor,
  WorkoutTemplateStatus,
  WorkoutWeekday,
} from '@/data/local/enums';
import { enumText } from './columns';

export const workoutTemplates = sqliteTable('workout_template', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  status: enumText<WorkoutTemplateStatus>()('status')
    .notNull()
    .default('ACTIVE'),
  color: enumText<WorkoutTemplateColor>()('color')
    .notNull()
    .default('TERRACOTTA'),
  scheduleType: enumText<WorkoutScheduleType>()('schedule_type'),
  scheduleInterval: integer('schedule_interval'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const workoutTemplateExercises = sqliteTable(
  'workout_template_exercise',
  {
    id: text('id').primaryKey().notNull(),
    workoutTemplateId: text('workout_template_id')
      .notNull()
      .references(() => workoutTemplates.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id').notNull(),
    position: integer('position').notNull(),
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
    setType: enumText<WorkoutSetType>()('set_type').notNull(),
    targetReps: integer('target_reps'),
    targetPercentage1Rm: real('target_percentage_1rm'),
    targetRpe: real('target_rpe'),
  },
  table => [
    index('idx_template_sets_exercise_position').on(
      table.workoutTemplateExerciseId,
      table.position,
    ),
  ],
);

export const workoutTemplateScheduleWeekdays = sqliteTable(
  'workout_template_schedule_weekday',
  {
    workoutTemplateId: text('workout_template_id')
      .notNull()
      .references(() => workoutTemplates.id, { onDelete: 'cascade' }),
    weekday: enumText<WorkoutWeekday>()('weekday').notNull(),
  },
  table => [
    primaryKey({
      columns: [table.workoutTemplateId, table.weekday],
      name: 'workout_template_schedule_weekday_pk',
    }),
  ],
);
