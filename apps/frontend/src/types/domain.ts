// Domain types — auto-derived from the Drizzle schema.
// Do NOT maintain these manually. Change the schema, types update automatically.

import type { InferSelectModel } from 'drizzle-orm';
import type {
  exercises,
  workoutTemplates,
  workoutTemplateExercises,
  workoutSessions,
  workoutSessionSets,
} from '../data/local/schema';

export type Exercise = InferSelectModel<typeof exercises>;
export type WorkoutTemplate = InferSelectModel<typeof workoutTemplates>;
export type WorkoutTemplateExercise = InferSelectModel<typeof workoutTemplateExercises>;
export type WorkoutSession = InferSelectModel<typeof workoutSessions>;
export type WorkoutSessionSet = InferSelectModel<typeof workoutSessionSets>;

// Re-export enums for convenience
export type {
  MuscleGroup,
  ExerciseCategory,
  ExerciseEquipment,
} from '../data/local/enums';
