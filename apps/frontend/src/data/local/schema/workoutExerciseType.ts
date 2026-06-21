import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Per-exercise-in-workout "type" tag (e.g. max effort / endurance / form) — the
// training intent for an exercise within a template. A separate taxonomy from
// the exercise's intrinsic `exercise_type` (Machine / Band / Bodyweight).
// Referenced by workout_template_exercise.type_id. Free-form, created on the fly.
export const workoutExerciseTypes = sqliteTable('workout_exercise_type', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  createdAt: integer('created_at').notNull(),
});
