import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
} from 'drizzle-orm/sqlite-core';

export const workoutTemplates = sqliteTable('workout_template', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  scheduleType: text('schedule_type'),
  scheduleInterval: integer('schedule_interval'),
});

export const workoutTemplateExercises = sqliteTable(
  'workout_template_exercise',
  {
    id: text('id').primaryKey().notNull(),
    workoutTemplateId: text('workout_template_id')
      .notNull()
      .references(() => workoutTemplates.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id').notNull(),
    orderIndex: integer('order_index').notNull(),
    sets: integer('sets').notNull(),
    targetReps: text('target_reps').notNull(),
    targetWeight: real('target_weight'),
    restSeconds: integer('rest_seconds'),
    notes: text('notes'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
);

export const workoutTemplateScheduleWeekdays = sqliteTable(
  'workout_template_schedule_weekday',
  {
    workoutTemplateId: text('workout_template_id')
      .notNull()
      .references(() => workoutTemplates.id, { onDelete: 'cascade' }),
    weekday: text('weekday').notNull(),
  },
  table => [
    primaryKey({
      columns: [table.workoutTemplateId, table.weekday],
      name: 'workout_template_schedule_weekday_pk',
    }),
  ],
);
