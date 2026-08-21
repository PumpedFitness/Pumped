import type { SetTypeId, WorkoutTemplateColor } from '@/data/local/enums';
import type { ProgressionGoal } from '@/types/setType';
import type { SetFieldValue } from '@/types/workout';

export type ExerciseOption = {
  id: string;
  name: string;
  description: string | null;
  typeId: string | null;
  typeName: string | null;
  picture: string | null;
  muscleGroupIds: string[];
  muscleGroupNames: string[];
};

export type ExerciseSelectionResult = {
  id: string;
  /** The complete selection, replacing the caller's exercise list. */
  exerciseIds: string[];
  /** The subset the user confirmed as a new superset, if they used that mode.
   *  Additive on purpose: `exerciseIds` keeps its meaning, so callers that do
   *  not support grouping simply ignore this. */
  newSupersetExerciseIds?: string[];
};

/** Result returned by the ExerciseSetEditor screen — a fully edited exercise. */
export type ExerciseEditResult = {
  id: string;
  exercise: EditableExercise;
};

export type EditableExerciseSet = {
  /** Local-only identity for stable React keys; never persisted. */
  id: string;
  setType: SetTypeId;
  restSeconds: number | null;
  progressionGoal?: ProgressionGoal | null;
  /** Target values for the set type's fields, keyed by set_type_field id. */
  fieldValues: SetFieldValue[];
};

export type EditableExercise = {
  exerciseId: string;
  typeId: string | null;
  /** Per-placement accent color; null inherits the template color. */
  color: WorkoutTemplateColor | null;
  /** Superset membership; null means the exercise stands alone. */
  supersetId: string | null;
  goal: string;
  notes: string | null;
  sets: EditableExerciseSet[];
};
